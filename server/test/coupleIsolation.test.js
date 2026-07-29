const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const PunishmentTemplate = require('../models/PunishmentTemplate');
const Healing = require('../models/Healing');
const punishmentController = require('../controllers/punishmentController');
const healingController = require('../controllers/healingController');

describe('couple data isolation', () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri(), { dbName: 'couple-isolation-test' });
    });

    afterEach(async () => {
        await mongoose.connection.dropDatabase();
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    it('returns only the current couple templates for the authenticated user', async () => {
        const coupleA = new mongoose.Types.ObjectId().toString();
        const coupleB = new mongoose.Types.ObjectId().toString();

        await PunishmentTemplate.create([
            { name: 'A template', text: 'A text', difficulty: 'low', coupleId: coupleA, createdBy: new mongoose.Types.ObjectId() },
            { name: 'B template', text: 'B text', difficulty: 'low', coupleId: coupleB, createdBy: new mongoose.Types.ObjectId() },
        ]);

        const req = { user: { coupleId: coupleA, _id: new mongoose.Types.ObjectId() } };
        const res = {
            statusCode: null,
            payload: null,
            status(code) {
                this.statusCode = code;
                return this;
            },
            json(payload) {
                this.payload = payload;
                return this;
            },
        };

        await punishmentController.getTemplates(req, res, () => { });

        expect(res.statusCode).toBeNull();
        expect(res.payload.success).toBe(true);
        expect(res.payload.data).toHaveLength(1);
        expect(res.payload.data[0].name).toBe('A template');
    });

    it('does not expose another couple\'s healing entries', async () => {
        const coupleA = new mongoose.Types.ObjectId();
        const coupleB = new mongoose.Types.ObjectId();
        const userA = new mongoose.Types.ObjectId();
        const userB = new mongoose.Types.ObjectId();

        await Healing.create([
            { coupleId: coupleA, userId: userA, createdBy: userA, from: 'A', to: 'B', title: 'A entry', message: 'A msg', type: 'mistake' },
            { coupleId: coupleB, userId: userB, createdBy: userB, from: 'C', to: 'D', title: 'B entry', message: 'B msg', type: 'mistake' },
        ]);

        const req = {
            user: { coupleId: coupleA, _id: userA, userId: userA },
            query: {},
        };
        const res = {
            statusCode: null,
            payload: null,
            status(code) {
                this.statusCode = code;
                return this;
            },
            json(payload) {
                this.payload = payload;
                return this;
            },
        };

        await healingController.getEntries(req, res, () => { });

        expect(res.statusCode).toBeNull();
        expect(res.payload.success).toBe(true);
        expect(res.payload.data).toHaveLength(1);
        expect(res.payload.data[0].title).toBe('A entry');
    });
});
