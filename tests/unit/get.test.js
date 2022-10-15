// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  const UUID = new RegExp(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
  );
  test('unauthenticated', () => request(app).get('/v1/fragments').expect(401));

  test('invalid credentials', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toBeInstanceOf(Object) && expect(res.body).toHaveProperty('fragments');
  });

  test('authenticated users get a fragments array of ids: user with fragments', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('new fragment');
    const id = postRes.body.fragment.id;
    const getRes = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');

    expect(getRes.status).toBe(200);
    expect(getRes.body.fragments).toContain(id);
    expect(getRes.body).toEqual({ status: 'ok', fragments: [id] });
    expect(getRes.body.fragments[0]).toMatch(UUID);
  });

  test('returned fragment metadata if correct id', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('fragment');
    const id = JSON.parse(res.text).fragment.id;
    const getRes = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1');
    expect(getRes.status).toBe(200);
  });
});
