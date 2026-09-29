import { APIRequestContext } from '@playwright/test';
import { BaseApiClient, ApiResponse } from './BaseApiClient.js';

/** Expected user response, including the server-assigned identifier and creation timestamp. */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

/** Fields submitted when creating a user; server-generated fields are intentionally excluded. */
export interface CreateUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

/** Editable profile fields accepted by the client; callers may provide only the fields they need. */
export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
}

/** Typed users-service operations whose endpoints are relative to the configured API prefix. */
export class UsersApiClient extends BaseApiClient {
  /** Uses the provided request context and API base URL, not the UI application's base URL. */
  constructor(request: APIRequestContext, baseUrl: string) {
    super(request, baseUrl);
  }

  /** Requests the user collection; callers assert the status and actual response shape. */
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.get<User[]>('users');
  }

  /** Requests one user by its server-issued ID, retaining error statuses such as 404. */
  async getUserById(id: string): Promise<ApiResponse<User>> {
    return this.get<User>(`users/${id}`);
  }

  /** Creates a user from the supplied registration data; teardown remains the caller's responsibility. */
  async createUser(payload: CreateUserPayload): Promise<ApiResponse<User>> {
    return this.post<User>('users', payload);
  }

  /** Sends the supplied editable profile fields to the user's PUT endpoint. */
  async updateUser(id: string, payload: UpdateUserPayload): Promise<ApiResponse<User>> {
    return this.put<User>(`users/${id}`, payload);
  }

  /** Requests deletion of one user without assuming which success status the service returns. */
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`users/${id}`);
  }
}
