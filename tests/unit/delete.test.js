const app = require('../../src/app');
const request = require('supertest');

describe('deleting posted fragment metadta', () => {
  test('delete fragment with 200', () => {
    // do post request to create a fragment first and then delete it
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
          .delete(`/v1/fragments/${id}`)
          .auth('user1@email.com', 'password1')
          .expect(200);
      });
  });

  test('404', () => {
    return request(app)
      .delete('/v1/fragments/404-')
      .auth('user1@email.com', 'password1')
      .expect(404);
  });

  test('should return 401', () => {
    return request(app).delete('/v1/fragments/404-').expect(401);
  });
});
