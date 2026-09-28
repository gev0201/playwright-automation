import type { EnvConfig } from '../src/utils/env.js';

export const prodConfig: EnvConfig = {
  baseUrl: 'https://www.example.com',
  apiUrl: 'https://www.example.com/api',
  adminUser: {
    email: '',
    password: '',
  },
};
