import type { EnvConfig } from '../src/utils/env.js';

export const stagingConfig: EnvConfig = {
  baseUrl: 'https://staging.example.com',
  apiUrl: 'https://staging.example.com/api',
  adminUser: {
    email: 'admin@staging.example.com',
    password: '',
  },
};
