import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, test } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-that-is-longer-than-thirty-two-characters';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/beauty-oil-market-test';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.MONGOMS_VERSION ||= '7.0.14';

let app;
let mongod;
let User;
let ActivityLog;

const registration = {
  name: 'Amina Test',
  email: 'amina@example.com',
  password: 'StrongPass1',
  passwordConfirm: 'StrongPass1',
  phone: '+250788123456',
};

before(async () => {
  mongod = await MongoMemoryServer.create();
  const { connectDB } = await import('../src/config/db.js');
  await connectDB(mongod.getUri());

  const appModule = await import('../src/app.js');
  const userModule = await import('../src/models/user.model.js');
  const activityModule = await import('../src/models/activityLog.model.js');

  app = appModule.default;
  User = userModule.User;
  ActivityLog = activityModule.ActivityLog;
});

beforeEach(async () => {
  await User.deleteMany({});
  await ActivityLog.deleteMany({});
});

after(async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
});

describe('API health', () => {
  test('reports a healthy API and database connection', async () => {
    const response = await request(app).get('/api/v1/health');

    assert.equal(response.status, 200);
    assert.equal(response.body.status, 'ok');
    assert.equal(response.body.database, 'connected');
  });
});

describe('Authentication', () => {
  test('registers a customer, hashes the password, and sets a secure cookie', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(registration);

    assert.equal(response.status, 201);
    assert.equal(response.body.data.user.email, registration.email);
    assert.equal(response.body.data.user.role, 'customer');
    assert.equal(response.body.data.user.password, undefined);

    const storedUser = await User.findOne({ email: registration.email }).select('+password');
    assert.notEqual(storedUser.password, registration.password);
    assert.match(storedUser.password, /^\$2[aby]\$/);

    const cookie = response.headers['set-cookie'][0];
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /SameSite=Lax/);
  });

  test('rejects duplicate email addresses', async () => {
    await request(app).post('/api/v1/auth/register').send(registration);
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(registration);

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
