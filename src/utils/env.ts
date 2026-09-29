import dotenv from 'dotenv';
import { devConfig } from '../../config/env.dev.js';
import { stagingConfig } from '../../config/env.staging.js';
import { prodConfig } from '../../config/env.prod.js';

dotenv.config({ quiet: true });

export interface EnvConfig {
  baseUrl: string;
  apiUrl: string;
  adminUser: { email: string; password: string };
}

const configs: Record<string, EnvConfig> = {
  dev: devConfig,
  staging: stagingConfig,
  prod: prodConfig,
};

function normalizeUrl(value: string, key: 'BASE_URL' | 'API_URL'): string {
  const message = `Invalid ${key}: expected an absolute HTTP(S) URL without credentials, query, or fragment.`;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(message);
  }
  if (!/^https?:\/\//i.test(value) || /[\s?#]/.test(value) || url.username || url.password) {
    throw new Error(message);
  }
  const normalized = url.href.replace(/\/+$/, '');
  return key === 'API_URL' ? `${normalized}/` : normalized;
}

export function getEnvConfig(env?: string, variables: NodeJS.ProcessEnv = process.env): EnvConfig {
  const target = env ?? variables.TEST_ENV ?? 'dev';
  if (!Object.hasOwn(configs, target)) {
    throw new Error(`Unknown environment: "${target}". Available: ${Object.keys(configs).join(', ')}`);
  }
  const config = configs[target];
  return {
    baseUrl: normalizeUrl(variables.BASE_URL ?? config.baseUrl, 'BASE_URL'),
    apiUrl: normalizeUrl(variables.API_URL ?? config.apiUrl, 'API_URL'),
    adminUser: {
      email: variables.ADMIN_EMAIL ?? config.adminUser.email,
      password: variables.ADMIN_PASSWORD ?? config.adminUser.password,
    },
  };
}
