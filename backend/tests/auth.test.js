const request = require('supertest');
const app = require('../src/index');

describe('Authentication Endpoints', () => {
  test('POST /api/auth/register should create new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      });
    
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('token');
  });

  test('POST /api/auth/login should authenticate user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@taskmanager.com',
        password: 'Admin123!'
      });
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});