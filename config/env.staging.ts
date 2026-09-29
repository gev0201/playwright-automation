import type { EnvConfig } from '../src/utils/env.js';

/** Example staging defaults selected by TEST_ENV=staging; replace targets through deployment settings. */
export const stagingConfig: EnvConfig = {
  // UI host used unless BASE_URL supplies an independent override.
  baseUrl: 'https://staging.example.com',
  // Service prefix used unless API_URL supplies an independent override.
  apiUrl: 'https://staging.example.com/api',
  // Placeholder account; provide actual authentication inputs through ADMIN_EMAIL/ADMIN_PASSWORD.
  adminUser: {
    email: 'admin@staging.example.com',
    password: '',
  },
};
