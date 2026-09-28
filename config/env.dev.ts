import type { EnvConfig } from '../src/utils/env.js';

export const devConfig: EnvConfig = {
  baseUrl: 'http://localhost:3000',
  apiUrl: 'http://localhost:3000/api',
  adminUser: {
    email: 'admin@dev.local',
    password: 'devpass',
  },
};
