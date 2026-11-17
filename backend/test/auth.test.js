import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, test } from 'node:test';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-that-is-longer-than-thirty-two-characters';
process.env.CLIENT_URL = 'http://localhost:5173';

const testDatabaseUri = process.env.TEST_MONGODB_URI || '';
process.env.MONGODB_URI = testDatabaseUri || 'mongodb://127.0.0.1:27017/beauty-oil-market-test';

// These tests drop collections, so they only run against an explicit test database.
const suite = testDatabaseUri ? describe : describe.skip;

let app;
let db;
let User;

const registration = {
  name: 'Amina Test',
  email: 'amina@example.com',
  password: 'StrongPass1',
  passwordConfirm: 'StrongPass1',
  phone: '+250788123456',
};

suite('Sharon Glow Boutique API', () => {
  before(async () => {
    const { connectDB, getDb } = await import('../src/config/db.js');
    const { migrate } = await import('../src/db/migrate.js');

    await connectDB();
    await migrate();

    db = getDb();
    app = (await import('../src/app.js')).default;
    User = (await import('../src/models/user.model.js')).User;
  });

  beforeEach(async () => {
    const collections = await db.listCollections().toArray();
    await Promise.all(collections.map((entry) => db.collection(entry.name).drop()));
  });

  after(async () => {
    const { disconnectDB } = await import('../src/config/db.js');
    await disconnectDB();
  });

  test('reports a healthy API and database connection', async () => {
    const response = await request(app).get('/api/v1/health');

    assert.equal(response.status, 200);
    assert.equal(response.body.status, 'ok');
    assert.equal(response.body.database, 'connected');
  });

  test('registers a customer, hashes the password, and sets a secure cookie', async () => {
    const response = await request(app).post('/api/v1/auth/register').send(registration);

    assert.equal(response.status, 201);
    assert.equal(response.body.data.user.email, registration.email);
    assert.equal(response.body.data.user.role, 'customer');
    assert.equal(response.body.data.user.password, undefined);

    const storedUser = await User.findByEmail(registration.email, { withPassword: true });
    assert.notEqual(storedUser.password, registration.password);
    assert.match(storedUser.password, /^\$2[aby]\$/);

    const cookie = response.headers['set-cookie'][0];
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /SameSite=Lax/);
  });

  test('rejects duplicate email addresses', async () => {
    await request(app).post('/api/v1/auth/register').send(registration);
    const response = await request(app).post('/api/v1/auth/register').send(registration);

    assert.equal(response.status, 409);
    assert.match(response.body.message, /already exists/i);
  });

  test('rejects weak passwords and mismatched confirmations', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        ...registration,
        password: 'weak',
        passwordConfirm: 'different',
      });

    assert.equal(response.status, 422);
    assert.ok(response.body.errors.length >= 1);
  });

  test('returns the signed-in user and clears the cookie on logout', async () => {
    const agent = request.agent(app);
    await agent.post('/api/v1/auth/register').send(registration);

    const me = await agent.get('/api/v1/auth/me');
    assert.equal(me.status, 200);
    assert.equal(me.body.data.user.email, registration.email);

    const logout = await agent.post('/api/v1/auth/logout');
    assert.equal(logout.status, 200);

    const afterLogout = await agent.get('/api/v1/auth/me');
    assert.equal(afterLogout.status, 401);
  });

  test('logs in with valid credentials and rejects invalid credentials', async () => {
    await request(app).post('/api/v1/auth/register').send(registration);

    const invalid = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: registration.email, password: 'WrongPass1' });
    assert.equal(invalid.status, 401);

    const valid = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: registration.email, password: registration.password });
    assert.equal(valid.status, 200);
    assert.equal(valid.body.data.user.email, registration.email);
  });

  test('requires authentication for the current user endpoint', async () => {
    const response = await request(app).get('/api/v1/auth/me');

    assert.equal(response.status, 401);
    assert.equal(response.body.success, false);
  });

  test('sanitizes script markup from user input', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        ...registration,
        name: '<script>alert(1)</script>Amina',
        email: 'xss@example.com',
      });

    assert.equal(response.status, 201);
    assert.equal(response.body.data.user.name.includes('<script>'), false);
  });
});
