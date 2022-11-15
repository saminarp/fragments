const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id/info', () => {
  test('info will return fragment metadata', async () => {
    const postReq = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('new fragment');

    const id = JSON.parse(postReq.text).fragment.id;
    const getReq = await request(app)
      .get(`/v1/fragments/${id}/info`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('new fragment');

    expect(getReq.status).toBe(200);
    expect(getReq.type).toBe('application/json');
  });

  test('if given id is not found', async () => {
    const getReq = await request(app)
      .get('/v1/fragments/123/info')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('new fragment');

    expect(getReq.status).toBe(404);
  });
});
