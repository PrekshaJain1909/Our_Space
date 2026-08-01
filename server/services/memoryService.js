const cloudinary = require("cloudinary").v2;
const Memory = require("../models/Memory");

const getCloudinaryConfig = () => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        return null;
    }

    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
    });

    return cloudinary;
};

exports.uploadMemoryImage = async (fileBuffer, originalName) => {
    const c = getCloudinaryConfig();
    if (!c) {
        const mimeType = originalName?.match(/\.(png|jpe?g|webp)$/i)?.[1] || "png";
        const normalizedMime = mimeType === "jpg" || mimeType === "jpeg" ? "jpeg" : mimeType;
        const base64 = fileBuffer.toString("base64");
        return {
            public_id: null,
            secure_url: `data:image/${normalizedMime};base64,${base64}`,
        };
    }

    return new Promise((resolve, reject) => {
        const stream = c.uploader.upload_stream(
            {
                folder: "together/memories",
                resource_type: "image",
            },
            (error, result) => {
                if (error) return reject(error);
                resolve({
                    public_id: result.public_id,
                    secure_url: result.secure_url,
                });
            }
        );

        stream.end(fileBuffer);
    });
};

exports.deleteMemoryImage = async (publicId) => {
    if (!publicId) return;
    const c = getCloudinaryConfig();
    await c.uploader.destroy(publicId);
};

exports.buildMemoryQuery = ({ query, mood, year, location, partner, tags, favorite, deleted, albumId, folder, sort }) => {
    const filter = {};

    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { location: { $regex: query, $options: "i" } },
            { tags: { $regex: query, $options: "i" } },
            { mood: { $regex: query, $options: "i" } },
        ];
    }

    if (mood) filter.mood = mood;
    if (location) filter.location = { $regex: location, $options: "i" };
    if (year) filter.date = { $gte: new Date(`${year}-01-01T00:00:00.000Z`), $lt: new Date(`${Number(year) + 1}-01-01T00:00:00.000Z`) };
    if (favorite === "true") filter.favorite = true;
    if (favorite === "false") filter.favorite = false;
    if (deleted === "true") filter.deleted = true;
    if (deleted === "false") filter.deleted = false;
    if (albumId) filter.albumId = albumId;
    if (folder) {
        if (folder === "favorites") filter.favorite = true;
        if (folder === "deleted") filter.deleted = true;
        if (folder === "trips") filter.tags = { $in: ["trip", "travel", "vacation", "goa", "manali"] };
        if (folder === "dates") filter.mood = "romantic";
        if (folder === "birthdays") filter.tags = { $in: ["birthday", "cake", "party"] };
        if (folder === "celebrations") filter.tags = { $in: ["celebration", "anniversary", "party"] };
        if (folder === "rainy-days") filter.tags = { $in: ["rain", "storm", "cloud", "winter"] };
        if (folder === "food") filter.tags = { $in: ["food", "chai", "coffee", "cafe", "restaurant"] };
    }
    if (partner) filter.createdBy = partner;
    if (tags) {
        const tagList = tags.split(",").map((tag) => tag.trim()).filter(Boolean);
        if (tagList.length) filter.tags = { $in: tagList };
    }

    if (filter.deleted === undefined) filter.deleted = false;

    let sortCriteria = { createdAt: -1 };
    if (sort === "oldest") sortCriteria = { createdAt: 1 };
    if (sort === "newest") sortCriteria = { createdAt: -1 };
    if (sort === "favorite") sortCriteria = { favorite: -1, createdAt: -1 };

    return { filter, sortCriteria };
};

exports.cleanupExpiredDeletedMemories = async () => {
    const threshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await Memory.deleteMany({ deleted: true, deletedAt: { $lte: threshold } });
    return result;
};
