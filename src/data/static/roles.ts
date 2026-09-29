/** Reference role identifiers for test data; actual permissions are defined by the application. */
export const ROLES = {
  /** Administrator role identifier. */
  ADMIN: 'admin',
  /** Standard user role identifier. */
  USER: 'user',
  /** Editor role identifier. */
  EDITOR: 'editor',
  /** Viewer role identifier. */
  VIEWER: 'viewer',
} as const;

/** Union of the role values, preventing callers from supplying arbitrary role strings. */
export type Role = (typeof ROLES)[keyof typeof ROLES];
