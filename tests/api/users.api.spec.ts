import { test, expect } from '../../src/fixtures/base.fixture.js';
import { createUser } from '../../src/data/factories/user.factory.js';

test.describe('Users API', () => {
  test('GET /api/users - should return list of users', async ({ usersApi }) => {
    const response = await usersApi.getUsers();
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBeTruthy();
  });

  test('POST /api/users - should create a new user', async ({ usersApi }) => {
    const userData = createUser();
    const response = await usersApi.createUser(userData);

    expect(response.status).toBe(201);
    expect(response.data.email).toBe(userData.email);
    expect(response.data.firstName).toBe(userData.firstName);
    expect(response.data.lastName).toBe(userData.lastName);
    expect(response.data).toHaveProperty('id');
  });

  test('GET /api/users/:id - should return a specific user', async ({ usersApi }) => {
    // Create a user first
    const userData = createUser();
    const createResponse = await usersApi.createUser(userData);
    const userId = createResponse.data.id;

    // Fetch the created user
    const response = await usersApi.getUserById(userId);
    expect(response.status).toBe(200);
    expect(response.data.id).toBe(userId);
    expect(response.data.email).toBe(userData.email);
  });

  test('PUT /api/users/:id - should update a user', async ({ usersApi }) => {
    // Create a user first
    const userData = createUser();
    const createResponse = await usersApi.createUser(userData);
    const userId = createResponse.data.id;

    // Update the user
    const updatePayload = { firstName: 'Updated', lastName: 'Name' };
    const response = await usersApi.updateUser(userId, updatePayload);

    expect(response.status).toBe(200);
    expect(response.data.firstName).toBe('Updated');
    expect(response.data.lastName).toBe('Name');
  });

  test('DELETE /api/users/:id - should delete a user', async ({ usersApi }) => {
    // Create a user first
    const userData = createUser();
    const createResponse = await usersApi.createUser(userData);
    const userId = createResponse.data.id;

    // Delete the user
    const response = await usersApi.deleteUser(userId);
    expect(response.status).toBe(200);

    // Verify deletion
    const getResponse = await usersApi.getUserById(userId);
    expect(getResponse.status).toBe(404);
  });
});
