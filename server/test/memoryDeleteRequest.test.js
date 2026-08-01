const express = require("express");
const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const memoryRoutes = require("../routes/memoryRoutes");
const { errorHandler } = require("../middleware/errorMiddleware");
const User = require("../models/User");
const Couple = require("../models/Couple");
const Album = require("../models/Album");
const AlbumDeleteRequest = require("../models/AlbumDeleteRequest");
const tokenService = require("../service/tokenService");

jest.setTimeout(60000);

let mongo;
let app;

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    process.env.JWT_SECRET = "test-secret";

    app = express();
    app.use(express.json());
    app.use("/api/memories", memoryRoutes);
    app.use(errorHandler);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
});

afterEach(async () => {
    const collections = Object.keys(mongoose.connection.collections);
    for (const collName of collections) {
        await mongoose.connection.collections[collName].deleteMany({});
    }
});

test("creates a delete request for the partner and exposes it in the pending-request list", async () => {
    const couple = await Couple.create({ coupleName: "Test Couple" });
    const userA = await User.create({
        name: "Alice",
        email: "alice@example.com",
        password: "secret",
        role: "partnerA",
        coupleId: couple._id,
        isVerified: true,
    });
    const userB = await User.create({
        name: "Bob",
        email: "bob@example.com",
        password: "secret",
        role: "partnerB",
        coupleId: couple._id,
        isVerified: true,
    });

    const album = await Album.create({
        coupleId: couple._id,
        createdBy: userA._id,
        name: "Trip to Goa",
    });

    const tokenA = tokenService.generateAuthToken({ userId: userA._id, email: userA.email, role: userA.role, coupleId: couple._id });
    const tokenB = tokenService.generateAuthToken({ userId: userB._id, email: userB.email, role: userB.role, coupleId: couple._id });

    const createResponse = await request(app)
        .post(`/api/memories/albums/${album._id}/delete-request`)
        .set("Authorization", `Bearer ${tokenA}`);

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.success).toBe(true);

    const savedRequest = await AlbumDeleteRequest.findOne({ albumId: album._id }).lean();
    expect(savedRequest).toBeTruthy();
    expect(savedRequest.requestedTo.toString()).toBe(userB._id.toString());
    expect(savedRequest.coupleId.toString()).toBe(couple._id.toString());
    expect(savedRequest.status).toBe("PENDING");

    const pendingResponse = await request(app)
        .get("/api/memories/albums/delete-requests")
        .set("Authorization", `Bearer ${tokenB}`);

    expect(pendingResponse.status).toBe(200);
    expect(pendingResponse.body.data).toHaveLength(1);
    expect(pendingResponse.body.data[0].albumId._id.toString()).toBe(album._id.toString());
    expect(pendingResponse.body.data[0].requestedTo._id.toString()).toBe(userB._id.toString());
});
