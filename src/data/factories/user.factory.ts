import { faker } from '@faker-js/faker';

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export function createUser(overrides: Partial<UserData> = {}): UserData {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password({ length: 12 }),
    ...overrides,
  };
}

export function createUsers(count: number, overrides: Partial<UserData> = {}): UserData[] {
  return Array.from({ length: count }, () => createUser(overrides));
}
