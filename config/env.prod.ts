import type { EnvConfig } from '../src/utils/env.js';

/** Example production defaults; selecting prod does not currently block mutating test operations. */
export const prodConfig: EnvConfig = {
  // Placeholder production UI host, overridable through BASE_URL.
  baseUrl: 'https://www.example.com',
  // Placeholder production API prefix, overridable independently through API_URL.
  apiUrl: 'https://www.example.com/api',
  // No real credentials are stored here; the loader permits blanks for tests that do not authenticate.
  adminUser: {
    email: '',
    password: '',
  },
};
