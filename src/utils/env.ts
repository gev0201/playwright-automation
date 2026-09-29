import dotenv from 'dotenv';
import { devConfig } from '../../config/env.dev.js';
import { stagingConfig } from '../../config/env.staging.js';
import { prodConfig } from '../../config/env.prod.js';

// Load .env quietly without replacing values already supplied by the shell or CI.
dotenv.config({ quiet: true });

/** Shared configuration contract for UI navigation, API requests, and authentication inputs. */
export interface EnvConfig {
  /** UI base URL used by browser projects. */
  baseUrl: string;
  /** Full API prefix; the loader normalizes it to one trailing slash. */
  apiUrl: string;
  /** Authentication inputs; this object does not perform login or create storage state. */
  adminUser: { email: string; password: string };
}

/** Supported environment names mapped to the single source of defaults in config/env.*.ts. */
const configs: Record<string, EnvConfig> = {
  dev: devConfig,
  staging: stagingConfig,
  prod: prodConfig,
};

/** Validates a target URL and normalizes trailing slashes while preserving its path prefix. */
function normalizeUrl(value: string, key: 'BASE_URL' | 'API_URL'): string {
  // Report the setting name, never the supplied URL, which could contain sensitive information.
  const message = `Invalid ${key}: expected an absolute HTTP(S) URL without credentials, query, or fragment.`;
  // Parsed URL reused for credential checks and canonical serialization.
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(message);
  }
  if (!/^https?:\/\//i.test(value) || /[\s?#]/.test(value) || url.username || url.password) {
    throw new Error(message);
  }
  // Remove trailing separators before adding exactly one for relative API endpoint resolution.
  const normalized = url.href.replace(/\/+$/, '');
  return key === 'API_URL' ? `${normalized}/` : normalized;
}

/**
 * Resolves explicit environment > TEST_ENV > dev, then overlays variables on file defaults.
 * BASE_URL and API_URL are independent. The optional variables map supports isolated tests.
 * Returns fresh objects and rejects invalid environment names or URLs before requests are made.
 */
export function getEnvConfig(env?: string, variables: NodeJS.ProcessEnv = process.env): EnvConfig {
  // Nullish selection deliberately leaves empty names invalid rather than silently choosing dev.
  const target = env ?? variables.TEST_ENV ?? 'dev';
  if (!Object.hasOwn(configs, target)) {
    throw new Error(`Unknown environment: "${target}". Available: ${Object.keys(configs).join(', ')}`);
  }
  // Read the selected defaults without mutating their exported configuration object.
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
