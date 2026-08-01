const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const cors = require('cors');
const moodRoutes = require('../routes/mood.routes');
const { errorHandler } = require('../middleware/errorMiddleware');
const User = require('../models/User');
const Couple = require('../models/Couple');
const tokenService = require('../service/tokenService');

let mongo;
let app;

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    process.env.JWT_SECRET = 'test-secret';
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/moods', moodRoutes);
    app.use(errorHandler);
});

afterAll(async () => {
    await mongoose.disconnect();
    if (mongo) await mongo.stop();
});

afterEach(async () => {
    const collections = Object.keys(mongoose.connection.collections);
    for (const collName of collections) {
        await mongoose.connection.collections[collName].deleteMany({});
    }
});

test('create mood, get calendar, and prevent duplicate mood for same date', async () => {
    const couple = await Couple.create({ coupleName: 'Test Couple' });
    const user = await User.create({ name: 'Test User', email: 'test@example.com', password: 'password', role: 'partnerA', coupleId: couple._id, isVerified: true });
    const token = tokenService.generateAuthToken({ userId: user._id, email: user.email, role: user.role, coupleId: couple._id });

    const date = '2026-07-25';
    const payload = { date, mood: 'happy', emoji: '😊', description: 'Today was great' };

    const createRes = await request(app)
        .post('/api/moods')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data).toMatchObject({ mood: 'happy', emoji: '😊', description: 'Today was great', date });

    const calendarRes = await request(app)
        .get('/api/moods/calendar?view=my')
        .set('Authorization', `Bearer ${token}`);

    expect(calendarRes.status).toBe(200);
    expect(calendarRes.body.data).toHaveLength(1);
    expect(calendarRes.body.data[0]).toMatchObject({ mood: 'happy', emoji: '😊', date });

    const duplicateRes = await request(app)
        .post('/api/moods')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.success).toBe(false);
    expect(duplicateRes.body.message).toContain('Mood already exists for this date');
});
