const express = require("express");
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const authMiddleware = require("../middleware/authMiddleware");

let mongoServer;
let app;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { dbName: "memorybox-test" });

    authMiddleware.authenticateToken = (req, res, next) => {
        req.user = {
            _id: new mongoose.Types.ObjectId(),
            coupleId: new mongoose.Types.ObjectId(),
            role: "partnerA",
        };
        next();
    };

    const memoryRoutes = require("../routes/memoryRoutes");
    app = express();
    app.use(express.json());
    app.use("/api/memories", memoryRoutes);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await mongoose.connection.db.dropDatabase();
});

test("creates an album, stores a memory, marks favorite, and soft deletes it", async () => {
    const albumRes = await request(app)
        .post("/api/memories/albums")
        .send({ name: "Summer getaway" })
        .expect(201);

    expect(albumRes.body.success).toBe(true);
    const albumId = albumRes.body.data._id;

    const memoryRes = await request(app)
        .post("/api/memories")
        .send({
            title: "Beach sunset",
            description: "Lovely evening",
            location: "Goa",
            mood: "romantic",
            tags: ["trip", "beach"],
            albumId,
        })
        .expect(201);

    expect(memoryRes.body.success).toBe(true);
    const memoryId = memoryRes.body.data._id;

    const favoriteRes = await request(app)
        .patch(`/api/memories/${memoryId}/favourite`)
        .expect(200);

    expect(favoriteRes.body.data.favorite).toBe(true);

    const foldersRes = await request(app)
        .get("/api/memories/folders")
        .expect(200);

    expect(foldersRes.body.data.some((folder) => folder.key === "favorites")).toBe(true);

    const deleteRes = await request(app)
        .delete(`/api/memories/${memoryId}`)
        .expect(200);

    expect(deleteRes.body.success).toBe(true);

    const deletedRes = await request(app)
        .get("/api/memories/deleted")
        .expect(200);

    expect(deletedRes.body.data).toHaveLength(1);
    expect(deletedRes.body.data[0].deleted).toBe(true);
});

test("newly created memories stay unfavorited when the request sends favorite as false", async () => {
    const albumRes = await request(app)
        .post("/api/memories/albums")
        .send({ name: "Quiet evening" })
        .expect(201);

    const memoryRes = await request(app)
        .post("/api/memories")
        .send({
            title: "Coffee by the window",
            albumId: albumRes.body.data._id,
            favorite: "false",
        })
        .expect(201);

    expect(memoryRes.body.success).toBe(true);
    expect(memoryRes.body.data.favorite).toBe(false);

    const foldersRes = await request(app)
        .get("/api/memories/folders")
        .expect(200);

    expect(foldersRes.body.data.some((folder) => folder.key === "favorites")).toBe(false);
});

test("returns paginated albums for large album lists", async () => {
    await Promise.all([
        request(app).post("/api/memories/albums").send({ name: "First album" }),
        request(app).post("/api/memories/albums").send({ name: "Second album" }),
    ]);

    const albumsRes = await request(app)
        .get("/api/memories/albums")
        .query({ page: 1, limit: 1 })
        .expect(200);

    expect(albumsRes.body.success).toBe(true);
    expect(albumsRes.body.data).toHaveLength(1);
    expect(albumsRes.body.pagination).toMatchObject({ page: 1, limit: 1, total: 2, pages: 2 });
});
