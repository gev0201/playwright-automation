import { APIRequestContext, APIResponse } from '@playwright/test';

export interface ApiResponse<T> {
  status: number;
  data: T;
  headers: { [key: string]: string };
}

export abstract class BaseApiClient {
  constructor(
    protected readonly request: APIRequestContext,
    protected readonly baseUrl: string
  ) {}

  protected async get<T>(endpoint: string, options?: object): Promise<ApiResponse<T>> {
    const response = await this.request.get(`${this.baseUrl}${endpoint}`, options);
    return this.parseResponse<T>(response);
  }

  protected async post<T>(endpoint: string, data?: object, options?: object): Promise<ApiResponse<T>> {
    const response = await this.request.post(`${this.baseUrl}${endpoint}`, {
      data,
      ...options,
    });
    return this.parseResponse<T>(response);
  }

  protected async put<T>(endpoint: string, data?: object, options?: object): Promise<ApiResponse<T>> {
    const response = await this.request.put(`${this.baseUrl}${endpoint}`, {
      data,
      ...options,
    });
    return this.parseResponse<T>(response);
  }

  protected async patch<T>(endpoint: string, data?: object, options?: object): Promise<ApiResponse<T>> {
    const response = await this.request.patch(`${this.baseUrl}${endpoint}`, {
      data,
      ...options,
    });
    return this.parseResponse<T>(response);
  }

  protected async delete<T = void>(endpoint: string, options?: object): Promise<ApiResponse<T>> {
    const response = await this.request.delete(`${this.baseUrl}${endpoint}`, options);
    return this.parseResponse<T>(response);
  }

  private async parseResponse<T>(response: APIResponse): Promise<ApiResponse<T>> {
    const status = response.status();
    const headers = response.headers();
    let data: T;

    try {
      data = await response.json();
    } catch {
      data = (await response.text()) as unknown as T;
    }

    return { status, data, headers };
  }
}
