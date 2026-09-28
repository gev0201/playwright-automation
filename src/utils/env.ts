export interface EnvConfig {
  baseUrl: string;
  apiUrl: string;
  adminUser: { email: string; password: string };
}

const configs: Record<string, EnvConfig> = {
  dev: {
    baseUrl: 'http://localhost:3000',
    apiUrl: 'http://localhost:3000/api',
    adminUser: { email: 'admin@dev.local', password: 'devpass' },
  },
  staging: {
    baseUrl: 'https://staging.example.com',
    apiUrl: 'https://staging.example.com/api',
    adminUser: { email: 'admin@staging.example.com', password: '' },
  },
  prod: {
    baseUrl: 'https://www.example.com',
    apiUrl: 'https://www.example.com/api',
    adminUser: { email: '', password: '' },
  },
};

export function getEnvConfig(env?: string): EnvConfig {
  const target = env || process.env.TEST_ENV || 'dev';
  const config = configs[target];
  if (!config) {
    throw new Error(`Unknown environment: "${target}". Available: ${Object.keys(configs).join(', ')}`);
  }
  return config;
}
