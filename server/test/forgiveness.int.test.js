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

test('create forgiveness request and accept it', async () => {
  const couple = await Couple.create({ coupleName: 'TestCouple' });
  const userA = await User.create({ name: 'Alice', email: 'alice@test.com', password: 'x', role: 'partnerA', coupleId: couple._id });
  const userB = await User.create({ name: 'Bob', email: 'bob@test.com', password: 'x', role: 'partnerB', coupleId: couple._id });
  await Couple.findByIdAndUpdate(couple._id, { partnerA: userA._id, partnerB: userB._id });

  const orig = await Healing.create({ coupleId: couple._id, userId: userA._id, createdBy: userA._id, from: 'Alice', to: 'Bob', type: 'mistake', title: 'Late reply fight', message: 'Sorry I was late', status: 'pending' });
  const tokenB = tokenService.generateAuthToken({ userId: userB._id, email: userB.email, role: userB.role, coupleId: couple._id });
  const tokenA = tokenService.generateAuthToken({ userId: userA._id, email: userA.email, role: userA.role, coupleId: couple._id });

  const payload = { originalEntryId: orig._id.toString(), forgivenessMessage: 'I forgive you, love.' };
  const postResp = await request(app).post('/api/forgiveness').set('Authorization', `Bearer ${tokenB}`).send(payload);
  expect(postResp.status).toBe(201);
  const forgivenessId = postResp.body.data._id;

  const pendingForgiveness = await Forgiveness.findById(forgivenessId).lean();
  expect(pendingForgiveness.status).toBe('pending');
  expect(pendingForgiveness.forgivenAt).toBeNull();
  expect((await Healing.findById(orig._id).lean()).status).toBe('pending');

  const acceptResp = await request(app).patch(`/api/forgiveness/${forgivenessId}/accept`).set('Authorization', `Bearer ${tokenA}`);
  expect(acceptResp.status).toBe(200);

  const dbForg = await Forgiveness.findById(forgivenessId).lean();
  expect(dbForg.status).toBe('accepted');
  expect(dbForg.forgivenAt).toBeTruthy();

  const dbOrig = await Healing.findById(orig._id).lean();
  expect(dbOrig.status).toBe('forgiven');
  expect(dbOrig.metadata.forgivenessMessage).toBe('I forgive you, love.');

  const getByOrig = await request(app).get(`/api/forgiveness/original/${orig._id.toString()}`).set('Authorization', `Bearer ${tokenA}`);
  expect(getByOrig.status).toBe(200);
  expect(getByOrig.body.data._id.toString()).toBe(forgivenessId.toString());
});
