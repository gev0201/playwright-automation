import { faker } from '@faker-js/faker';

/** Generated registration data shared by UI scenarios and API creation requests. */
export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/** Generates user data, then applies overrides; it does not create a user in the application. */
export function createUser(overrides: Partial<UserData> = {}): UserData {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password({ length: 12 }),
    ...overrides,
  };
}

/** Generates count independent objects with the same overrides; uniqueness is not guaranteed. */
export function createUsers(count: number, overrides: Partial<UserData> = {}): UserData[] {
  return Array.from({ length: count }, () => createUser(overrides));
}
