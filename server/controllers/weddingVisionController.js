const path = require('path');
const fs = require('fs');
const WeddingVision = require('../models/WeddingVision');
const Couple = require('../models/Couple');
const { sanitizeText } = require('../utils/sanitize');
const mongoose = require('mongoose');

const getValidObjectId = (id) => {
    if (!id) return null;
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return new mongoose.Types.ObjectId(id);
};

const sendError = (res, status, message) => res.status(status).json({ success: false, message });

exports.uploadImage = async (req, res, next) => {
    try {
        if (!req.file) return sendError(res, 400, 'No image uploaded.');
        const imageUrl = `/uploads/wedding/${req.file.filename}`;
        return res.status(201).json({ success: true, data: { imageUrl } });
    } catch (err) {
        next(err);
    }
};

exports.createVisionItem = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) return sendError(res, 401, 'Unauthorized');

        const { type, title, description, image, referenceLink, favorite } = req.body;
        if (!type || !title || !image) return sendError(res, 400, 'Type, title and image are required.');

        const coupleId = getValidObjectId(user.coupleId);
        if (!coupleId) return sendError(res, 400, 'Invalid couple reference.');

        const couple = await Couple.findById(coupleId).select('partnerA partnerB');
        if (!couple) return sendError(res, 400, 'Associated couple not found.');

        // determine the partner id (the other member of the couple)
        let partnerId = null;
        try {
            const uid = getValidObjectId(user._id);
            if (couple.partnerA && couple.partnerB) {
                partnerId = couple.partnerA.toString() === uid.toString() ? couple.partnerB : couple.partnerA;
            } else {
                partnerId = couple.partnerA || couple.partnerB || null;
            }
        } catch (e) {
            partnerId = null;
        }

        const item = await WeddingVision.create({
            userId: getValidObjectId(user._id),
            partnerId: getValidObjectId(partnerId),
            coupleId: coupleId,
            type: sanitizeText(type),
            title: sanitizeText(title),
            description: description ? sanitizeText(description) : '',
            image: sanitizeText(image),
            referenceLink: referenceLink ? sanitizeText(referenceLink) : null,
            favorite: Boolean(favorite),
        });

        return res.status(201).json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
};

exports.getVisionItems = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) return sendError(res, 401, 'Unauthorized');
        const coupleId = getValidObjectId(user.coupleId);
        if (!coupleId) return sendError(res, 400, 'Invalid couple reference.');

        const items = await WeddingVision.find({ coupleId }).sort({ createdAt: -1 }).lean();
        return res.json({ success: true, data: items });
    } catch (err) {
        next(err);
    }
};

exports.updateVisionItem = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) return sendError(res, 401, 'Unauthorized');
        const { id } = req.params;
        if (!getValidObjectId(id)) return sendError(res, 400, 'Invalid item id.');

        const item = await WeddingVision.findById(id);
        if (!item) return sendError(res, 404, 'Item not found.');
        if (item.coupleId.toString() !== user.coupleId?.toString()) return sendError(res, 403, 'Forbidden');

        const { type, title, description, image, referenceLink, favorite } = req.body;
        if (type) item.type = sanitizeText(type);
        if (title) item.title = sanitizeText(title);
        item.description = description !== undefined ? sanitizeText(description) : item.description;
        item.referenceLink = referenceLink !== undefined ? sanitizeText(referenceLink) : item.referenceLink;
        item.favorite = favorite !== undefined ? Boolean(favorite) : item.favorite;
        if (image) item.image = sanitizeText(image);
        item.updatedAt = new Date();

        await item.save();
        return res.json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
};

exports.deleteVisionItem = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) return sendError(res, 401, 'Unauthorized');
        const { id } = req.params;
        if (!getValidObjectId(id)) return sendError(res, 400, 'Invalid item id.');

        const item = await WeddingVision.findById(id);
        if (!item) return sendError(res, 404, 'Item not found.');
        if (item.coupleId.toString() !== user.coupleId?.toString()) return sendError(res, 403, 'Forbidden');

        if (item.image && item.image.startsWith('/uploads/wedding/')) {
            const filePath = path.join(__dirname, '..', item.image.replace(/^\//, ''));
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr && unlinkErr.code !== 'ENOENT') {
                    console.warn('Failed to remove wedding vision image:', unlinkErr.message);
                }
            });
        }

        await item.remove();
        return res.json({ success: true, message: 'Wedding vision item deleted.' });
    } catch (err) {
        next(err);
    }
};
