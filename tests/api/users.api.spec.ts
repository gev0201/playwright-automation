import { test, expect } from '../../src/fixtures/base.fixture.js';
import { createUser } from '../../src/data/factories/user.factory.js';

// Application-level CRUD examples; these mutate real test data and do not yet provide full teardown.
test.describe('Users API', () => {
  // Check the collection's status and outer shape without depending on a particular user count.
  test('GET /api/users - should return list of users', async ({ usersApi }) => {
    // Collection response used for transport and payload-shape assertions.
    const response = await usersApi.getUsers();
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBeTruthy();
  });

  // Verify the creation endpoint returns the submitted profile and a server-generated identifier.
  test('POST /api/users - should create a new user', async ({ usersApi }) => {
    // Generated registration input shared by the request and expected response assertions.
    const userData = createUser();
    // Creation response; the current example leaves cleanup to future data fixtures.
    const response = await usersApi.createUser(userData);

    expect(response.status).toBe(201);
    expect(response.data.email).toBe(userData.email);
    expect(response.data.firstName).toBe(userData.firstName);
    expect(response.data.lastName).toBe(userData.lastName);
    expect(response.data).toHaveProperty('id');
  });

  // Create this test's own lookup target rather than depending on another test's execution order.
  test('GET /api/users/:id - should return a specific user', async ({ usersApi }) => {
    // Create a user first
    const userData = createUser();
    // Setup response from which the lookup identifier is taken.
    const createResponse = await usersApi.createUser(userData);
    // Server-issued identifier used by the subsequent GET request.
    const userId = createResponse.data.id;

    // Fetch the created user
    const response = await usersApi.getUserById(userId);
    expect(response.status).toBe(200);
    expect(response.data.id).toBe(userId);
    expect(response.data.email).toBe(userData.email);
  });

  // Verify profile updates on a user created by this test, not on a pre-existing shared account.
  test('PUT /api/users/:id - should update a user', async ({ usersApi }) => {
    // Create a user first
    const userData = createUser();
    // Setup response for the resource that will be updated.
    const createResponse = await usersApi.createUser(userData);
    // Identifier tying the update request to this test's newly created user.
    const userId = createResponse.data.id;

    // Update the user
    const updatePayload = { firstName: 'Updated', lastName: 'Name' };
    // Update response checked for both status and the changed field values.
    const response = await usersApi.updateUser(userId, updatePayload);

    expect(response.status).toBe(200);
    expect(response.data.firstName).toBe('Updated');
    expect(response.data.lastName).toBe('Name');
  });

  // Verify deletion through a follow-up read as well as the delete response itself.
  test('DELETE /api/users/:id - should delete a user', async ({ usersApi }) => {
    // Create a user first
    const userData = createUser();
    // Setup response for the disposable deletion target.
    const createResponse = await usersApi.createUser(userData);
    // Identifier used for deletion and the subsequent not-found check.
    const userId = createResponse.data.id;

    // Delete the user
    const response = await usersApi.deleteUser(userId);
    expect(response.status).toBe(200);

    // Verify deletion
    const getResponse = await usersApi.getUserById(userId);
    expect(getResponse.status).toBe(404);
  });
});
