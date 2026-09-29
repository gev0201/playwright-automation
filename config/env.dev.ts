import type { EnvConfig } from '../src/utils/env.js';

/** Local development defaults; the shared loader overlays shell/.env values without mutating these. */
export const devConfig: EnvConfig = {
  // UI application expected to be started separately on the development machine.
  baseUrl: 'http://localhost:3000',
  // Full API prefix, including /api; client endpoints must not repeat that segment.
  apiUrl: 'http://localhost:3000/api',
  // Example development account only; override credentials to match the application under test.
  adminUser: {
    email: 'admin@dev.local',
    password: 'devpass',
  },
};
