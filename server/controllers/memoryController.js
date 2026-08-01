const Memory = require("../models/Memory");
const Album = require("../models/Album");
const User = require("../models/User");
const AlbumDeleteRequest = require("../models/AlbumDeleteRequest");
const { asyncHandler } = require("../middleware/asyncHandler");
const { uploadMemoryImage, deleteMemoryImage, buildMemoryQuery, cleanupExpiredDeletedMemories } = require("../services/memoryService");
const { Types } = require("mongoose");

const normalizeTags = (tags) =>
    Array.isArray(tags)
        ? tags.map((tag) => String(tag).trim()).filter(Boolean)
        : String(tags || "")
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);

const normalizeAlbumId = (albumId) => {
    if (!albumId || albumId === "null") return null;
    return albumId;
};

const normalizeFavoriteValue = (value) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (["true", "1", "yes", "y", "on"].includes(normalized)) return true;
        if (["false", "0", "no", "n", "off", "", "null", "undefined"].includes(normalized)) return false;
    }
    return Boolean(value);
};

const memoryProjection = "title description location date mood tags favorite deleted deletedAt photos albumId createdBy createdAt updatedAt visibility partner likes";
const albumProjection = "name coverImage description photoCount createdBy createdAt updatedAt deleted";

const buildLeanMemoryQuery = (query) => query.select(memoryProjection);
const buildLeanAlbumQuery = (query) => query.select(albumProjection);

const syncAlbumPhotoState = async (coupleId, albumId) => {
    if (!albumId) return null;

    const album = await Album.findOne({ _id: albumId, coupleId, deleted: false });
    if (!album) return null;

    const [photoCount, latestMemory] = await Promise.all([
        Memory.countDocuments({ coupleId, albumId: album._id, deleted: false, photos: { $ne: [] } }),
        buildLeanMemoryQuery(Memory.findOne({ coupleId, albumId: album._id, deleted: false, photos: { $ne: [] } }).sort({ createdAt: -1 })).lean(),
    ]);

    const coverImageFromLatest = latestMemory?.photos?.[0]?.secure_url || "";
    album.photoCount = photoCount;

    if (!album.coverImage && coverImageFromLatest) {
        album.coverImage = coverImageFromLatest;
    }

    await album.save();
    return album;
};

const getCoupleIdOrThrow = (req) => {
    if (!req.user?.coupleId) {
        const error = new Error("You must belong to a couple to access memories.");
        error.statusCode = 403;
        throw error;
    }
    return req.user.coupleId;
};

const emitMemoryEvent = (req, eventName, payload) => {
    const io = req.app.get("io");
    if (!io) return;
    const coupleRoom = `couple:${req.user.coupleId.toString()}`;
    io.to(coupleRoom).emit(eventName, payload);
};

exports.createMemory = asyncHandler(async (req, res) => {
    const coupleId = getCoupleIdOrThrow(req);
    const { title, description, location, date, mood, tags, visibility, favorite, albumId, partner } = req.body;

    const baseTitle = title && String(title).trim() ? String(title).trim() : "Captured moment";

    if (String(baseTitle).trim().length > 120) {
        return res.status(400).json({ success: false, message: "Title cannot exceed 120 characters." });
    }

    if (description && String(description).length > 4000) {
        return res.status(400).json({ success: false, message: "Description cannot exceed 4000 characters." });
    }

    let normalizedAlbumId = normalizeAlbumId(albumId);
    if (normalizedAlbumId && !Types.ObjectId.isValid(normalizedAlbumId)) {
        return res.status(400).json({ success: false, message: "Invalid albumId format." });
    }

    if (normalizedAlbumId) {
        const album = await Album.findOne({ _id: normalizedAlbumId, coupleId, deleted: false });
        if (!album) {
            return res.status(404).json({ success: false, message: "Album not found." });
        }
    }

    if (!req.files || !req.files.length) {
        return res.status(400).json({ success: false, message: "At least one photo is required." });
    }

    const createdMemories = [];
    for (const [index, file] of req.files.entries()) {
        const upload = await uploadMemoryImage(file.buffer, file.originalname);
        const memoryTitle = req.files.length > 1 ? `${baseTitle} ${index + 1}`.trim() : baseTitle;

        const memory = await Memory.create({
            coupleId,
            createdBy: req.user._id,
            albumId: normalizedAlbumId,
            title: memoryTitle,
            description: description ? String(description).trim() : "",
            photos: [upload],
            location: location ? String(location).trim() : "",
            date: date ? new Date(date) : new Date(),
            mood: mood ? String(mood).trim() : "happy",
            tags: normalizeTags(tags),
            favorite: normalizeFavoriteValue(favorite),
            visibility: visibility || "couple",
            partner: partner ? String(partner).trim() : "",
        });

        createdMemories.push(memory.toObject());
    }

    const updatedAlbum = normalizedAlbumId ? await syncAlbumPhotoState(coupleId, normalizedAlbumId) : null;

    emitMemoryEvent(req, "memory:created", { memories: createdMemories });
    res.status(201).json({ success: true, message: "Memories created successfully.", data: createdMemories, updatedAlbum });
});

exports.uploadPhotosToAlbum = asyncHandler(async (req, res) => {
    const coupleId = getCoupleIdOrThrow(req);
    const { albumId } = req.params;
    const { title, description, location, date, mood, tags, visibility, favorite, partner } = req.body;

    console.log("[memory upload] request received", { albumId, fileCount: req.files?.length || 0, title, bodyKeys: Object.keys(req.body || {}) });

    if (!req.files || !req.files.length) {
        return res.status(400).json({ success: false, message: "At least one photo is required." });
    }

    const normalizedAlbumId = normalizeAlbumId(albumId);
    if (!normalizedAlbumId) {
        return res.status(400).json({ success: false, message: "Album id is required." });
    }

    const album = await Album.findOne({ _id: normalizedAlbumId, coupleId, deleted: false });
    if (!album) {
        return res.status(404).json({ success: false, message: "Album not found." });
    }

    const baseTitle = title && String(title).trim() ? String(title).trim() : "Captured moment";
    const createdMemories = [];

    for (const [index, file] of req.files.entries()) {
        console.log("[memory upload] processing file", { index, originalName: file.originalname, size: file.size, mimetype: file.mimetype });
        const upload = await uploadMemoryImage(file.buffer, file.originalname);
        const memoryTitle = req.files.length > 1 ? `${baseTitle} ${index + 1}`.trim() : baseTitle;
        const memory = await Memory.create({
            coupleId,
            createdBy: req.user._id,
            albumId: normalizedAlbumId,
            title: memoryTitle,
            description: description ? String(description).trim() : "",
            photos: [upload],
            location: location ? String(location).trim() : "",
            date: date ? new Date(date) : new Date(),
            mood: mood ? String(mood).trim() : "happy",
            tags: normalizeTags(tags),
            favorite: normalizeFavoriteValue(favorite),
            visibility: visibility || "couple",
            partner: partner ? String(partner).trim() : "",
        });

        createdMemories.push(memory.toObject());
    }

    const updatedAlbum = await syncAlbumPhotoState(coupleId, normalizedAlbumId);
    console.log("[memory upload] saved memories", { albumId: normalizedAlbumId, count: createdMemories.length, updatedAlbum });
    emitMemoryEvent(req, "memory:created", { memories: createdMemories });

    res.status(201).json({
        success: true,
        message: "Photos uploaded successfully.",
        uploadedPhotos: createdMemories,
        updatedAlbum,
    });
});

exports.getMemories = asyncHandler(async (req, res) => {
    await cleanupExpiredDeletedMemories();
    const coupleId = getCoupleIdOrThrow(req);
    const {
        query,
        mood,
        year,
        location,
        partner,
        tags,
        favorite,
        deleted,
        albumId,
        sort = "newest",
        page = 1,
        limit = 20,
    } = req.query;

    const { filter, sortCriteria } = buildMemoryQuery({
        query,
        mood,
        year,
        location,
        partner,
        tags,
        favorite,
        deleted,
        albumId,
        sort,
    });

    filter.coupleId = coupleId;

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNumber - 1) * limitNumber;

    const [memories, total] = await Promise.all([
        buildLeanMemoryQuery(Memory.find(filter).sort(sortCriteria).skip(skip).limit(limitNumber)).lean(),
        Memory.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        data: memories,
        pagination: {
            page: pageNumber,
            limit: limitNumber,
            total,
            pages: Math.ceil(total / limitNumber),
        },
    });
});

exports.getMemoryById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid memory id format." });
    }

    const coupleId = getCoupleIdOrThrow(req);
    const memory = await buildLeanMemoryQuery(Memory.findOne({ _id: id, coupleId })).lean();
    if (!memory) {
        return res.status(404).json({ success: false, message: "Memory not found." });
    }
    res.status(200).json({ success: true, data: memory });
});

exports.updateMemory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid memory id format." });
    }

    const coupleId = getCoupleIdOrThrow(req);
    const memory = await Memory.findOne({ _id: id, coupleId });
    if (!memory) {
        return res.status(404).json({ success: false, message: "Memory not found." });
    }

    if (memory.createdBy.toString() !== req.user._id.toString() && req.user.role !== "partnerA" && req.user.role !== "partnerB") {
        return res.status(403).json({ success: false, message: "You can only edit memories you created." });
    }

    const { title, description, location, date, mood, tags, visibility, favorite, albumId, partner } = req.body;
    if (title !== undefined) {
        if (!String(title).trim()) {
            return res.status(400).json({ success: false, message: "Title is required." });
        }
        if (String(title).trim().length > 120) {
            return res.status(400).json({ success: false, message: "Title cannot exceed 120 characters." });
        }
        memory.title = String(title).trim();
    }
    if (description !== undefined) {
        if (String(description).length > 4000) {
            return res.status(400).json({ success: false, message: "Description cannot exceed 4000 characters." });
        }
        memory.description = String(description).trim();
    }
    if (location !== undefined) memory.location = String(location).trim();
    if (date !== undefined) memory.date = new Date(date);
    if (mood !== undefined) memory.mood = String(mood).trim();
    if (tags !== undefined) memory.tags = normalizeTags(tags);
    if (visibility !== undefined) memory.visibility = visibility;
    if (favorite !== undefined) memory.favorite = normalizeFavoriteValue(favorite);
    if (partner !== undefined) memory.partner = String(partner).trim();
    if (albumId !== undefined) {
        let normalizedAlbumId = normalizeAlbumId(albumId);
        if (normalizedAlbumId && !Types.ObjectId.isValid(normalizedAlbumId)) {
            return res.status(400).json({ success: false, message: "Invalid albumId format." });
        }
        if (normalizedAlbumId) {
            const album = await Album.findOne({ _id: normalizedAlbumId, coupleId, deleted: false });
            if (!album) {
                return res.status(404).json({ success: false, message: "Album not found." });
            }
        }
        memory.albumId = normalizedAlbumId;
    }

    if (req.files && req.files.length) {
        for (const photo of memory.photos || []) {
            if (photo.public_id) await deleteMemoryImage(photo.public_id);
        }
        const uploadedPhotos = [];
        for (const file of req.files) {
            uploadedPhotos.push(await uploadMemoryImage(file.buffer, file.originalname));
        }
        memory.photos = uploadedPhotos;
    }

    await memory.save();
    const updatedMemory = memory.toObject();
    emitMemoryEvent(req, "memory:updated", { memory: updatedMemory });
    res.status(200).json({ success: true, message: "Memory updated successfully.", data: updatedMemory });
});

exports.deleteMemory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid memory id format." });
    }

    const coupleId = getCoupleIdOrThrow(req);
    const memory = await Memory.findOne({ _id: id, coupleId });
    if (!memory) {
        return res.status(404).json({ success: false, message: "Memory not found." });
    }

    if (memory.createdBy.toString() !== req.user._id.toString() && req.user.role !== "partnerA" && req.user.role !== "partnerB") {
        return res.status(403).json({ success: false, message: "You can only delete memories you created." });
    }

    memory.deleted = true;
    memory.deletedAt = new Date();
    await memory.save();
    if (memory.albumId) {
        await syncAlbumPhotoState(coupleId, memory.albumId);
    }
    emitMemoryEvent(req, "memory:deleted", { memoryId: id });
    res.status(200).json({ success: true, message: "Memory moved to recently deleted." });
});

exports.toggleFavourite = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid memory id format." });
    }

    const coupleId = getCoupleIdOrThrow(req);
    const memory = await Memory.findOne({ _id: id, coupleId });
    if (!memory) {
        return res.status(404).json({ success: false, message: "Memory not found." });
    }

    memory.favorite = !memory.favorite;
    await memory.save();
    emitMemoryEvent(req, "memory:favourited", { memoryId: id, favorite: memory.favorite });
    res.status(200).json({ success: true, message: "Favourite status updated.", data: { _id: memory._id, favorite: memory.favorite } });
});

exports.togglePin = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid memory id format." });
    }

    const coupleId = getCoupleIdOrThrow(req);
    const memory = await Memory.findOne({ _id: id, coupleId });
    if (!memory) {
        return res.status(404).json({ success: false, message: "Memory not found." });
    }

    memory.favorite = !memory.favorite;
    await memory.save();
    emitMemoryEvent(req, "memory:pinned", { memoryId: id, favorite: memory.favorite });
    res.status(200).json({ success: true, message: "Pin status updated.", data: { _id: memory._id, favorite: memory.favorite } });
});

exports.reactToMemory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid memory id format." });
    }

    const coupleId = getCoupleIdOrThrow(req);
    const memory = await Memory.findOne({ _id: id, coupleId });
    if (!memory) {
        return res.status(404).json({ success: false, message: "Memory not found." });
    }

    const { emoji } = req.body;
    if (!emoji || !String(emoji).trim()) {
        return res.status(400).json({ success: false, message: "Emoji is required." });
    }

    const existingReaction = memory.reactions.find((reaction) => reaction.user.toString() === req.user._id.toString());
    if (existingReaction) {
        existingReaction.emoji = String(emoji).trim();
        existingReaction.createdAt = new Date();
    } else {
        memory.reactions.push({ user: req.user._id, emoji: String(emoji).trim() });
    }

    await memory.save();
    emitMemoryEvent(req, "memory:reacted", { memoryId: id, reactions: memory.reactions });
    res.status(200).json({ success: true, message: "Reaction saved.", data: memory.reactions });
});

exports.removeReaction = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid memory id format." });
    }

    const coupleId = getCoupleIdOrThrow(req);
    const memory = await Memory.findOne({ _id: id, coupleId });
    if (!memory) {
        return res.status(404).json({ success: false, message: "Memory not found." });
    }

    memory.reactions = memory.reactions.filter((reaction) => reaction.user.toString() !== req.user._id.toString());
    await memory.save();
    emitMemoryEvent(req, "memory:reacted", { memoryId: id, reactions: memory.reactions });
    res.status(200).json({ success: true, message: "Reaction removed.", data: memory.reactions });
});

exports.addComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid memory id format." });
    }

    const coupleId = getCoupleIdOrThrow(req);
    const memory = await Memory.findOne({ _id: id, coupleId });
    if (!memory) {
        return res.status(404).json({ success: false, message: "Memory not found." });
    }

    const { message } = req.body;
    if (!message || !String(message).trim()) {
        return res.status(400).json({ success: false, message: "Comment message is required." });
    }

    memory.comments.push({ user: req.user._id, message: String(message).trim() });
    await memory.save();
    const updatedMemory = await memory.populate({ path: "comments.user", select: "name" });
    emitMemoryEvent(req, "memory:commented", { memoryId: id, comments: updatedMemory.comments });
    res.status(200).json({ success: true, message: "Comment added.", data: updatedMemory.comments });
});

exports.deleteComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid memory id format." });
    }

    const coupleId = getCoupleIdOrThrow(req);
    const memory = await Memory.findOne({ coupleId, comments: { $elemMatch: { _id: id } } });
    if (!memory) {
        return res.status(404).json({ success: false, message: "Comment not found." });
    }

    if (memory.coupleId.toString() !== coupleId.toString()) {
        return res.status(403).json({ success: false, message: "You cannot manage comments from another couple." });
    }

    memory.comments = memory.comments.filter((comment) => comment._id.toString() !== id);
    await memory.save();
    emitMemoryEvent(req, "memory:commented", { memoryId: memory._id, comments: memory.comments });
    res.status(200).json({ success: true, message: "Comment deleted." });
});

exports.getTimeline = asyncHandler(async (req, res) => {
    await cleanupExpiredDeletedMemories();
    const coupleId = getCoupleIdOrThrow(req);
    const memories = await buildLeanMemoryQuery(Memory.find({ coupleId, deleted: false }).sort({ date: 1 })).lean();
    const grouped = memories.reduce((acc, memory) => {
        const year = new Date(memory.date).getFullYear();
        if (!acc[year]) acc[year] = [];
        acc[year].push(memory);
        return acc;
    }, {});

    res.status(200).json({ success: true, data: grouped });
});

exports.getOnThisDay = asyncHandler(async (req, res) => {
    await cleanupExpiredDeletedMemories();
    const coupleId = getCoupleIdOrThrow(req);
    const today = new Date();
    const memories = await buildLeanMemoryQuery(Memory.find({
        coupleId,
        deleted: false,
        date: {
            $gte: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate(), 0, 0, 0),
            $lt: new Date(today.getFullYear() + 1, today.getMonth(), today.getDate(), 23, 59, 59),
        },
    }).sort({ date: -1 })).lean();

    const matching = memories.filter((memory) => {
        const memoryDate = new Date(memory.date);
        return memoryDate.getMonth() === today.getMonth() && memoryDate.getDate() === today.getDate();
    });

    res.status(200).json({ success: true, data: matching });
});

exports.getStats = asyncHandler(async (req, res) => {
    await cleanupExpiredDeletedMemories();
    const coupleId = getCoupleIdOrThrow(req);
    const currentYear = new Date().getFullYear();
    const [totalMemories, photos, favorites, deleted, albums, trips] = await Promise.all([
        Memory.countDocuments({ coupleId, deleted: false }),
        Memory.countDocuments({ coupleId, deleted: false, photos: { $ne: [] } }),
        Memory.countDocuments({ coupleId, deleted: false, favorite: true }),
        Memory.countDocuments({ coupleId, deleted: true }),
        Album.countDocuments({ coupleId, deleted: false }),
        Memory.countDocuments({ coupleId, deleted: false, tags: { $in: ["trip", "travel", "vacation", "goa", "manali"] } }),
    ]);

    res.status(200).json({
        success: true,
        data: {
            totalMemories,
            photos,
            albums,
            favorites,
            deleted,
            trips,
        },
    });
});

exports.getFolders = asyncHandler(async (req, res) => {
    await cleanupExpiredDeletedMemories();
    const coupleId = getCoupleIdOrThrow(req);
    const [favoritesCount, tripsCount, datesCount, birthdaysCount, celebrationsCount, rainyDaysCount, foodCount, deletedCount] = await Promise.all([
        Memory.countDocuments({ coupleId, deleted: false, favorite: true }),
        Memory.countDocuments({ coupleId, deleted: false, tags: { $in: ["trip", "travel", "vacation", "goa", "manali"] } }),
        Memory.countDocuments({ coupleId, deleted: false, mood: "romantic" }),
        Memory.countDocuments({ coupleId, deleted: false, tags: { $in: ["birthday", "cake", "party"] } }),
        Memory.countDocuments({ coupleId, deleted: false, tags: { $in: ["celebration", "anniversary", "party"] } }),
        Memory.countDocuments({ coupleId, deleted: false, tags: { $in: ["rain", "storm", "cloud", "winter"] } }),
        Memory.countDocuments({ coupleId, deleted: false, tags: { $in: ["food", "chai", "coffee", "cafe", "restaurant"] } }),
        Memory.countDocuments({ coupleId, deleted: true }),
    ]);

    const folders = [
        { key: "favorites", label: "Favorites", count: favoritesCount },
        { key: "trips", label: "Trips", count: tripsCount },
        { key: "dates", label: "Dates", count: datesCount },
        { key: "birthdays", label: "Birthdays", count: birthdaysCount },
        { key: "celebrations", label: "Celebrations", count: celebrationsCount },
        { key: "rainy-days", label: "Rainy Days", count: rainyDaysCount },
        { key: "food", label: "Food", count: foodCount },
        { key: "deleted", label: "Recently Deleted", count: deletedCount },
    ];

    res.status(200).json({ success: true, data: folders });
});

exports.getAlbums = asyncHandler(async (req, res) => {
    await cleanupExpiredDeletedMemories();
    const coupleId = getCoupleIdOrThrow(req);
    const pageNumber = Math.max(1, Number(req.query.page) || 1);
    const limitNumber = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const skip = (pageNumber - 1) * limitNumber;

    const [albums, total] = await Promise.all([
        buildLeanAlbumQuery(Album.find({ coupleId, deleted: false }).sort({ createdAt: -1 }).skip(skip).limit(limitNumber)).lean(),
        Album.countDocuments({ coupleId, deleted: false }),
    ]);

    res.status(200).json({
        success: true,
        data: albums,
        pagination: {
            page: pageNumber,
            limit: limitNumber,
            total,
            pages: Math.ceil(total / limitNumber),
        },
    });
});

exports.getAlbumById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid album id format." });
    }

    const coupleId = getCoupleIdOrThrow(req);
    const [album, memories] = await Promise.all([
        buildLeanAlbumQuery(Album.findOne({ _id: id, coupleId, deleted: false })).lean(),
        buildLeanMemoryQuery(Memory.find({ coupleId, albumId: id, deleted: false }).sort({ createdAt: -1 })).lean(),
    ]);

    if (!album) {
        return res.status(404).json({ success: false, message: "Album not found." });
    }

    res.status(200).json({ success: true, data: { album, memories } });
});

exports.getAlbumPhotos = asyncHandler(async (req, res) => {
    const { albumId } = req.params;
    if (!Types.ObjectId.isValid(albumId)) {
        return res.status(400).json({ success: false, message: "Invalid album id format." });
    }

    const coupleId = getCoupleIdOrThrow(req);
    const sortParam = String(req.query.sort || "newest").toLowerCase();
    const sortCriteria = sortParam === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    const album = await Album.findOne({ _id: albumId, coupleId, deleted: false }).lean();
    if (!album) {
        return res.status(404).json({ success: false, message: "Album not found." });
    }

    const photos = await buildLeanMemoryQuery(Memory.find({ coupleId, albumId, deleted: false, photos: { $ne: [] } }).sort(sortCriteria)).lean();

    res.status(200).json({ success: true, data: photos });
});

exports.createAlbum = asyncHandler(async (req, res) => {
    const coupleId = getCoupleIdOrThrow(req);
    const { name, description, coverImage } = req.body;

    if (!name || !String(name).trim()) {
        return res.status(400).json({ success: false, message: "Album name is required." });
    }

    const album = await Album.create({
        coupleId,
        createdBy: req.user._id,
        name: String(name).trim(),
        description: description ? String(description).trim() : "",
        coverImage: coverImage ? String(coverImage).trim() : "",
    });

    res.status(201).json({ success: true, message: "Album created successfully.", data: album.toObject() });
});

exports.updateAlbum = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid album id format." });
    }

    const coupleId = getCoupleIdOrThrow(req);
    const album = await Album.findOne({ _id: id, coupleId, deleted: false });
    if (!album) {
        return res.status(404).json({ success: false, message: "Album not found." });
    }

    const { name, description, coverImage } = req.body;
    if (name !== undefined) {
        if (!String(name).trim()) return res.status(400).json({ success: false, message: "Album name is required." });
        album.name = String(name).trim();
    }
    if (description !== undefined) album.description = String(description).trim();
    if (coverImage !== undefined) album.coverImage = String(coverImage).trim();

    await album.save();
    res.status(200).json({ success: true, message: "Album updated successfully.", data: album.toObject() });
});

exports.createAlbumDeleteRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid album id format." });
    }

    const coupleId = getCoupleIdOrThrow(req);
    const album = await Album.findOne({ _id: id, coupleId, deleted: false });
    if (!album) {
        return res.status(404).json({ success: false, message: "Album not found." });
    }

    const existingPending = await AlbumDeleteRequest.findOne({ albumId: album._id, coupleId, status: "PENDING" });
    if (existingPending) {
        return res.status(409).json({ success: false, message: "A delete request is already pending for this album." });
    }

    const otherPartner = await User.findOne({ coupleId, _id: { $ne: req.user._id } }).select("_id name");
    if (!otherPartner) {
        return res.status(400).json({ success: false, message: "No partner is available to approve this deletion." });
    }

    console.log("[album delete request] create", {
        currentUserId: req.user._id?.toString(),
        partnerId: otherPartner._id?.toString(),
        albumId: album._id?.toString(),
        coupleId: coupleId?.toString(),
    });

    const request = await AlbumDeleteRequest.create({
        albumId: album._id,
        requestedBy: req.user._id,
        requestedTo: otherPartner._id,
        coupleId,
        status: "PENDING",
    });

    const [albumSummary, requestedBySummary, requestedToSummary] = await Promise.all([
        Album.findById(album._id).select("name coverImage").lean(),
        User.findById(req.user._id).select("name").lean(),
        User.findById(otherPartner._id).select("name").lean(),
    ]);

    const populatedRequest = {
        ...request.toObject(),
        albumId: albumSummary,
        requestedBy: requestedBySummary,
        requestedTo: requestedToSummary,
    };

    console.log("[album delete request] saved", { requestId: request._id?.toString(), albumId: request.albumId?.toString(), requestedTo: request.requestedTo?.toString(), status: request.status });

    const io = req.app.get("io");
    if (io) {
        io.to(`couple:${coupleId.toString()}`).emit("album-delete-request", {
            requestId: request._id.toString(),
            albumId: album._id.toString(),
            albumName: album.name,
            requestedBy: req.user._id.toString(),
            requestedTo: otherPartner._id.toString(),
            status: "PENDING",
        });
    }

    res.status(201).json({ success: true, message: "Delete request sent to your partner.", data: populatedRequest });
});

exports.getAlbumDeleteRequests = asyncHandler(async (req, res) => {
    const coupleId = getCoupleIdOrThrow(req);
    const requests = await AlbumDeleteRequest.find({
        coupleId,
        requestedTo: req.user._id,
        status: "PENDING",
    })
        .select("albumId requestedBy requestedTo coupleId status createdAt updatedAt")
        .sort({ createdAt: -1 })
        .lean();

    const populatedRequests = await Promise.all(requests.map(async (request) => {
        const [albumSummary, requestedBySummary, requestedToSummary] = await Promise.all([
            Album.findById(request.albumId).select("name coverImage").lean(),
            User.findById(request.requestedBy).select("name").lean(),
            User.findById(request.requestedTo).select("name").lean(),
        ]);

        return {
            ...request,
            albumId: albumSummary,
            requestedBy: requestedBySummary,
            requestedTo: requestedToSummary,
        };
    }));

    console.log("[album delete request] get pending", { userId: req.user._id?.toString(), coupleId: coupleId?.toString(), count: populatedRequests.length });
    res.status(200).json({ success: true, data: populatedRequests });
});

exports.approveAlbumDeleteRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid request id format." });
    }

    const coupleId = getCoupleIdOrThrow(req);
    const request = await AlbumDeleteRequest.findOne({ _id: id, coupleId, status: "PENDING" });
    if (!request) {
        return res.status(404).json({ success: false, message: "Delete request not found." });
    }

    if (request.requestedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: "Only the requested partner can approve this deletion." });
    }

    const album = await Album.findOne({ _id: request.albumId, coupleId, deleted: false });
    if (!album) {
        return res.status(404).json({ success: false, message: "Album not found." });
    }

    album.deleted = true;
    await album.save();
    await Memory.updateMany({ coupleId, albumId: album._id }, { albumId: null, deleted: true, deletedAt: new Date() });
    request.status = "APPROVED";
    await request.save();

    const io = req.app.get("io");
    if (io) {
        io.to(`couple:${coupleId.toString()}`).emit("album-delete-approved", {
            requestId: request._id.toString(),
            albumId: album._id.toString(),
            albumName: album.name,
        });
    }

    res.status(200).json({ success: true, message: "Album deleted with mutual approval.", data: request });
});

exports.rejectAlbumDeleteRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid request id format." });
    }

    const coupleId = getCoupleIdOrThrow(req);
    const request = await AlbumDeleteRequest.findOne({ _id: id, coupleId, status: "PENDING" });
    if (!request) {
        return res.status(404).json({ success: false, message: "Delete request not found." });
    }

    if (request.requestedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: "Only the requested partner can reject this deletion." });
    }

    const album = await Album.findById(request.albumId).select("name").lean();
    request.status = "REJECTED";
    await request.save();

    const io = req.app.get("io");
    if (io) {
        io.to(`couple:${coupleId.toString()}`).emit("album-delete-rejected", {
            requestId: request._id.toString(),
            albumId: request.albumId.toString(),
            albumName: album?.name || "Album",
        });
    }

    res.status(200).json({ success: true, message: "Deletion request rejected.", data: request });
});

exports.deleteAlbum = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid album id format." });
    }

    const coupleId = getCoupleIdOrThrow(req);
    const album = await Album.findOne({ _id: id, coupleId, deleted: false });
    if (!album) {
        return res.status(404).json({ success: false, message: "Album not found." });
    }

    album.deleted = true;
    await album.save();
    await Memory.updateMany({ coupleId, albumId: album._id }, { albumId: null, deleted: true, deletedAt: new Date() });
    res.status(200).json({ success: true, message: "Album deleted successfully." });
});

exports.getFavorites = asyncHandler(async (req, res) => {
    await cleanupExpiredDeletedMemories();
    const coupleId = getCoupleIdOrThrow(req);
    const memories = await buildLeanMemoryQuery(Memory.find({ coupleId, deleted: false, favorite: true }).sort({ createdAt: -1 })).lean();
    res.status(200).json({ success: true, data: memories });
});

exports.getDeleted = asyncHandler(async (req, res) => {
    await cleanupExpiredDeletedMemories();
    const coupleId = getCoupleIdOrThrow(req);
    const memories = await buildLeanMemoryQuery(Memory.find({ coupleId, deleted: true }).sort({ deletedAt: -1 })).lean();
    res.status(200).json({ success: true, data: memories });
});

exports.restoreMemory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid memory id format." });
    }

    const coupleId = getCoupleIdOrThrow(req);
    const memory = await Memory.findOne({ _id: id, coupleId, deleted: true });
    if (!memory) {
        return res.status(404).json({ success: false, message: "Deleted memory not found." });
    }

    memory.deleted = false;
    memory.deletedAt = null;
    await memory.save();
    if (memory.albumId) {
        await syncAlbumPhotoState(coupleId, memory.albumId);
    }
    res.status(200).json({ success: true, message: "Memory restored successfully.", data: memory });
});

exports.deleteForever = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid memory id format." });
    }

    const coupleId = getCoupleIdOrThrow(req);
    const memory = await Memory.findOne({ _id: id, coupleId, deleted: true });
    if (!memory) {
        return res.status(404).json({ success: false, message: "Deleted memory not found." });
    }

    for (const photo of memory.photos || []) {
        if (photo.public_id) await deleteMemoryImage(photo.public_id);
    }

    await memory.deleteOne();
    if (memory.albumId) {
        await syncAlbumPhotoState(coupleId, memory.albumId);
    }
    res.status(200).json({ success: true, message: "Memory permanently deleted." });
});
