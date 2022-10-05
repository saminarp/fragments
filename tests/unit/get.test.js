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
    expect(getRes.body.fragment).toContain(id);
    expect(getRes.body).toEqual({ status: 'ok', fragment: [id] });
    expect(getRes.body.fragment[0]).toMatch(UUID);
  });
});

describe('GET /v1/fragments/:id', () => {
  test('Valid fragment id should return data, type and size', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('new fragment');

    const id = postRes.body.fragment.id;
    const getRes = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1');

    expect(getRes.body).toEqual({
      status: 'ok', //200
      data: 'new fragment',
      type: 'text/plain',
      size: Buffer.byteLength('new fragment'), // 12
    });

    expect(getRes.body.size).toBe(Number(getRes.body.size));
  });
  test('Unauthorized acess to fragment', () => request(app).get('/v1/fragments/1').expect(401));

  test('Invalid Fragment ID', () => {
    return request(app).get('/v1/fragments/1').auth('user1@email.com', 'password1').expect(404);
  });
});
