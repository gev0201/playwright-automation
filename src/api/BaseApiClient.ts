import { APIRequestContext, APIResponse } from '@playwright/test';

/** Response envelope; T describes the expected body but is not validated at runtime. */
export interface ApiResponse<T> {
  /** HTTP status code retained for both successful and negative test cases. */
  status: number;
  /** Parsed JSON, or a text fallback cast to the caller's expected type. */
  data: T;
  /** Response headers returned by Playwright. */
  headers: { [key: string]: string };
}

/** Shared HTTP transport and response parsing for service-specific API clients. */
export abstract class BaseApiClient {
  /** Uses the caller-owned request context and full service prefix, including any API path. */
  constructor(
    protected readonly request: APIRequestContext,
    protected readonly baseUrl: string
  ) {}

  /** Sends GET to a service-relative endpoint and returns its status, headers, and body. */
  protected async get<T>(endpoint: string, options?: object): Promise<ApiResponse<T>> {
    // Raw Playwright response before conversion to the framework's response envelope.
    const response = await this.request.get(this.resolveUrl(endpoint), options);
    return this.parseResponse<T>(response);
  }

  /** Sends POST with a payload; supplied request options can override the default data option. */
  protected async post<T>(endpoint: string, data?: object, options?: object): Promise<ApiResponse<T>> {
    // Raw POST result, including non-success statuses needed by negative tests.
    const response = await this.request.post(this.resolveUrl(endpoint), {
      data,
      ...options,
    });
    return this.parseResponse<T>(response);
  }

  /** Sends PUT with the supplied payload and returns the parsed response envelope. */
  protected async put<T>(endpoint: string, data?: object, options?: object): Promise<ApiResponse<T>> {
    // Raw update response; parsing does not assert whether the update succeeded.
    const response = await this.request.put(this.resolveUrl(endpoint), {
      data,
      ...options,
    });
    return this.parseResponse<T>(response);
  }

  /** Sends PATCH for endpoints that accept partial updates. */
  protected async patch<T>(endpoint: string, data?: object, options?: object): Promise<ApiResponse<T>> {
    // Raw partial-update response, normalized by the common parser below.
    const response = await this.request.patch(this.resolveUrl(endpoint), {
      data,
      ...options,
    });
    return this.parseResponse<T>(response);
  }

  /** Sends DELETE; the default void type does not prevent the server from returning a body. */
  protected async delete<T = void>(endpoint: string, options?: object): Promise<ApiResponse<T>> {
    // Raw deletion response, retaining its status for caller assertions.
    const response = await this.request.delete(this.resolveUrl(endpoint), options);
    return this.parseResponse<T>(response);
  }

  /** Joins an endpoint to the service prefix without discarding that prefix for leading slashes. */
  private resolveUrl(endpoint: string): string {
    return new URL(endpoint.replace(/^\/+/, ''), `${this.baseUrl.replace(/\/+$/, '')}/`).toString();
  }

  /** Attempts JSON parsing, falling back to text without validating the resulting body's shape. */
  private async parseResponse<T>(response: APIResponse): Promise<ApiResponse<T>> {
    // Preserve the status even when the body is an error document or is empty.
    const status = response.status();
    // Retain metadata such as content type alongside the parsed body.
    const headers = response.headers();
    // Assigned by either JSON parsing or the text fallback.
    let data: T;

    try {
      data = await response.json();
    } catch {
      data = (await response.text()) as unknown as T;
    }

    return { status, data, headers };
  }
}
