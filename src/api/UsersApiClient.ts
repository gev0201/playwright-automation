import { APIRequestContext } from '@playwright/test';
import { BaseApiClient, ApiResponse } from './BaseApiClient.js';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface CreateUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export class UsersApiClient extends BaseApiClient {
  constructor(request: APIRequestContext, baseUrl: string) {
    super(request, baseUrl);
  }

  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.get<User[]>('users');
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return this.get<User>(`users/${id}`);
  }

  async createUser(payload: CreateUserPayload): Promise<ApiResponse<User>> {
    return this.post<User>('users', payload);
  }

  async updateUser(id: string, payload: UpdateUserPayload): Promise<ApiResponse<User>> {
    return this.put<User>(`users/${id}`, payload);
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`users/${id}`);
  }
}
