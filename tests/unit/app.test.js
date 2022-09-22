const request = require('supertest');

const app = require('../../src/app');

describe('Error code 404 : Thrown if, the route does not exist', () => {
  test('Response HTTP 404 returned due to route that does not exist', async () => {
    const res = await request(app).get('/wrong-route');
    expect(res.statusCode).toBe(404);
  });
});
