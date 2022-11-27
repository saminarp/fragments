const request = require('supertest');
const app = require('../../src/app');

describe('GET route tests for id:.:ext', () => {
  test('if extension specified, proceed to convert to the specified format', async () => {
    const postReq = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('new fragment');
    const id = JSON.parse(postReq.text).fragment.id;
    const getReq = await request(app)
      .get(`/v1/fragments/${id}.txt`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('new fragment');
    expect(getReq.status).toBe(200);

    expect(getReq.type).toBe('text/plain');
  });

  test('if the given extension is unsupported', async () => {
    const postReq = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('new fragment');
    const id = JSON.parse(postReq.text).fragment.id;
    const getReq = await request(app)
      .get(`/v1/fragments/${id}.json`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('new fragment');
    expect(getReq.status).toBe(404);
  });
});
