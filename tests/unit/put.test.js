const request = require('supertest');
const app = require('../../src/app');

describe('PUT /v1/fragments/:id', () => {
  test('attempt to update a fragment with a different content type than the original will fail with 400', () => {
    return request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('fragment data')
      .expect(201)
      .then((req) => {
        const body = JSON.parse(req.text);
        const id = body.fragment.id;

        return request(app)
          .put(`/v1/fragments/${id}`)
          .auth('user1@email.com', 'password1')
          .set('Content-Type', 'text/html')
          .send('<html>fragment data</html>')
          .expect(400);
      });
  });

  test('authenticated user can update a fragment with the same content type', () => {
    return request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('fragment data')
      .expect(201)
      .then((req) => {
        const body = JSON.parse(req.text);
        const id = body.fragment.id;

        return request(app)
          .put(`/v1/fragments/${id}`)
          .auth('user1@email.com', 'password1')
          .set('Content-Type', 'text/plain')
          .send('updated fragment data')
          .expect(200);
      });
  });

  test('attempt to update a fragment that does not exist will fail with 404', () => {
    return request(app)
      .put('/v1/fragments/404-')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('updated fragment data')
      .expect(404);
  });
});
