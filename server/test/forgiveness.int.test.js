const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const createApp = require('./appForTest');
const User = require('../models/User');
const Couple = require('../models/Couple');
const Healing = require('../models/Healing');
const Forgiveness = require('../models/Forgiveness');
const tokenService = require('../service/tokenService');

jest.setTimeout(60000);

let mongo;
let app;
let server;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  process.env.JWT_SECRET = 'test-secret';
  app = createApp();
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

afterEach(async () => {
  // clean DB
  const collections = Object.keys(mongoose.connection.collections);
  for (const collName of collections) {
    await mongoose.connection.collections[collName].deleteMany({});
  }
});

test('create forgiveness and update original healing', async () => {
  // create couple
  const couple = await Couple.create({ coupleName: 'TestCouple' });

  // create users
  const userA = await User.create({ name: 'Alice', email: 'alice@test.com', password: 'x', role: 'partnerA', coupleId: couple._id });
  const userB = await User.create({ name: 'Bob', email: 'bob@test.com', password: 'x', role: 'partnerB', coupleId: couple._id });

  // create a healing entry (original)
  const orig = await Healing.create({ coupleId: couple._id, userId: userA._id, createdBy: userA._id, from: 'Alice', to: 'Bob', type: 'mistake', title: 'Late reply fight', message: 'Sorry I was late', status: 'pending' });

  // generate token for Bob (forgiver)
  const token = tokenService.generateAuthToken({ userId: userB._id, email: userB.email, role: userB.role, coupleId: couple._id });

  // POST /api/forgiveness
  const payload = { originalEntryId: orig._id.toString(), forgivenessMessage: 'I forgive you, love.' };
  const postResp = await request(app).post('/api/forgiveness').set('Authorization', `Bearer ${token}`).send(payload);
  expect(postResp.status).toBe(201);
  expect(postResp.body).toHaveProperty('success', true);
  expect(postResp.body).toHaveProperty('data');
  const forgivenessId = postResp.body.data._id;

  // Ensure forgiveness document exists in DB
  const dbForg = await Forgiveness.findById(forgivenessId).lean();
  expect(dbForg).not.toBeNull();
  expect(dbForg.originalEntryId.toString()).toBe(orig._id.toString());
  expect(dbForg.forgivenessMessage).toBe('I forgive you, love.');
  expect(dbForg.status).toBe('forgiven');
  expect(dbForg.forgivenAt).toBeTruthy();

  // Ensure original healing updated
  const dbOrig = await Healing.findById(orig._id).lean();
  expect(dbOrig.status).toBe('forgiven');
  expect(dbOrig.metadata).toBeTruthy();
  expect(dbOrig.metadata.forgivenessMessage).toBe('I forgive you, love.');
  expect(dbOrig.metadata.forgivenAt).toBeTruthy();

  // GET /api/forgiveness/original/:originalId
  const getByOrig = await request(app).get(`/api/forgiveness/original/${orig._id.toString()}`).set('Authorization', `Bearer ${token}`);
  expect(getByOrig.status).toBe(200);
  expect(getByOrig.body.data).toBeTruthy();
  expect(getByOrig.body.data._id.toString()).toBe(forgivenessId.toString());

  // GET /api/healing/entries should include updated orig
  const entriesResp = await request(app).get('/api/healing/entries').set('Authorization', `Bearer ${token}`);
  expect(entriesResp.status).toBe(200);
  const entries = entriesResp.body.data;
  const found = entries.find(e => e._id.toString() === orig._id.toString());
  expect(found).toBeTruthy();
  expect(found.status).toBe('forgiven');
});
