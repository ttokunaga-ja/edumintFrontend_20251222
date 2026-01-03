import { server } from '@/mocks/server';

// The server is already started in vitest.setup.ts

test('GET /users/:userId returns mocked user with id param', async () => {
  // Use the full URL that axios would use
  const res = await fetch('http://localhost:3000/api/users/u_k8P3n9L2mR5qW4xZ');
  const json = await res.json();
  expect(json).toHaveProperty('id', 'u_k8P3n9L2mR5qW4xZ');
});

test('GET /user/profile/:userId also returns mocked user', async () => {
  const res = await fetch('http://localhost:3000/api/user/profile/v_l9Q4o8N3pS6rX5yA');
  const json = await res.json();
  expect(json).toHaveProperty('id', 'v_l9Q4o8N3pS6rX5yA');
});
