const request = require('supertest');
const app = require('../../src/app');

describe('POST /v1/fragment', () => {
  const UUID = new RegExp(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
  );
  const fragmentDate = new RegExp(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
  test('Authenticated users should be able to create fragments', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send('new fragment');
    expect(res.status).toBe(201);
  });

  test('Created fragment should proper data', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send('new fragment');

    console.log(res.body.id);
    //ID
    expect(res.body.fragment.id).toMatch(UUID);
    //TODO: owner ID needs to be hashed email
    //expect(res.body.ownerId).toMatch(/^[0-9a-f]{32}$/);
    //create and updated should be ISO Date strings
    expect(res.body.fragment.created && res.body.fragment.updated).toMatch(fragmentDate);
    //type should be text/plain
    expect(res.body.fragment.type).toBe('text/plain');
    // size
    expect(res.body.fragment.size).toBe(12);
  });

  test('Location URL must be present in header and match the fragment ID', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send('new fragment');
    // retrieve the fragment Id from headers  and check if it matches the fragment ID
    expect(postRes.headers.location).toMatch(`v1/fragments/${postRes.body.fragment.id}`);
  });

  test('Unauthenticated users should not be able to create fragments', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send('new fragment');
    expect(res.status).toBe(401);
  });

  test('Invalid credentials', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('failme', 'failme')
      .send('new fragment');

    expect(res.status).toBe(401);
  });
});
