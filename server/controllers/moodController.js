const mongoose = require('mongoose');
const Mood = require('../models/Mood');
const moodService = require('../services/moodService');
const { asyncHandler } = require('../middleware/asyncHandler');

const getCoupleIdOrThrow = (req) => {
    if (!req.user?.coupleId) {
        const error = new Error('You must belong to a couple to access this feature.');
        error.statusCode = 403;
        throw error;
    }
    return req.user.coupleId;
};

const buildValidationError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

exports.createMood = asyncHandler(async (req, res) => {
    const coupleId = getCoupleIdOrThrow(req);
    const userId = req.user._id;
    const { date, mood, emoji, description } = req.body;

    if (!date) throw buildValidationError('date is required');
    if (!mood) throw buildValidationError('mood is required');
    if (!emoji) throw buildValidationError('emoji is required');
    if (String(description || '').length > 300) throw buildValidationError('Description cannot exceed 300 characters.');

    const createdMood = await moodService.createMood({ coupleId, userId, date, mood, emoji, description });
    res.status(201).json({ success: true, message: 'Mood created', data: createdMood });
});

exports.getCalendar = asyncHandler(async (req, res) => {
    const coupleId = getCoupleIdOrThrow(req);
    const userId = req.user._id;
    const { view = 'both', month, year } = req.query;

    if (!['my', 'partner', 'both'].includes(view)) {
        throw buildValidationError('view must be one of my, partner, both');
    }

    const calendar = await moodService.getCalendar({ coupleId, userId, view, month, year });
    res.json({ success: true, message: 'Mood calendar retrieved', data: calendar });
});

exports.getDateDetails = asyncHandler(async (req, res) => {
    const coupleId = getCoupleIdOrThrow(req);
    const userId = req.user._id;
    const { date } = req.params;
    if (!date) throw buildValidationError('date is required');

    const details = await moodService.getDateDetails({ coupleId, date, userId });
    res.json({ success: true, message: 'Mood details retrieved', data: details });
});

exports.updateMood = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const moodId = req.params.id;
    if (!moodId || !mongoose.Types.ObjectId.isValid(moodId)) {
        throw buildValidationError('Invalid mood id');
    }
    const { mood, emoji, description } = req.body;
    if (!mood && !emoji && description === undefined) {
        throw buildValidationError('At least one field is required to update');
    }
    if (description !== undefined && String(description).length > 300) {
        throw buildValidationError('Description cannot exceed 300 characters.');
    }

    const coupleId = getCoupleIdOrThrow(req);
    const updated = await moodService.updateMood({ id: moodId, coupleId, userId, mood, emoji, description });
    res.json({ success: true, message: 'Mood updated', data: updated });
});

exports.deleteMood = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const moodId = req.params.id;
    if (!moodId || !mongoose.Types.ObjectId.isValid(moodId)) {
        throw buildValidationError('Invalid mood id');
    }
    const coupleId = getCoupleIdOrThrow(req);
    const deleted = await moodService.deleteMood({ id: moodId, coupleId, userId });
    res.json({ success: true, message: 'Mood deleted', data: deleted });
});

exports.getMonthlyStats = asyncHandler(async (req, res) => {
    const coupleId = getCoupleIdOrThrow(req);
    const userId = req.user._id;
    const { month, year } = req.query;
    const stats = await moodService.getMonthlyStats({ coupleId, userId, month, year });
    res.json({ success: true, message: 'Monthly mood statistics retrieved', data: stats });
});

exports.getSummary = asyncHandler(async (req, res) => {
    const coupleId = getCoupleIdOrThrow(req);
    const { month, year } = req.query;
    const summary = await moodService.getSummary({ coupleId, month, year });
    res.json({ success: true, message: 'Mood summary retrieved', data: summary });
});

exports.getTrend = asyncHandler(async (req, res) => {
    const coupleId = getCoupleIdOrThrow(req);
    const userId = req.user._id;
    const { month, year } = req.query;
    const trend = await moodService.getTrend({ coupleId, userId, month, year });
    res.json({ success: true, message: 'Mood trend retrieved', data: trend });
});

exports.getDistribution = asyncHandler(async (req, res) => {
    const coupleId = getCoupleIdOrThrow(req);
    const userId = req.user._id;
    const distribution = await moodService.getDistribution({ coupleId, userId });
    res.json({ success: true, message: 'Mood distribution retrieved', data: distribution });
});

exports.getComparison = asyncHandler(async (req, res) => {
    const coupleId = getCoupleIdOrThrow(req);
    const userId = req.user._id;
    const comparison = await moodService.getComparison({ coupleId, userId });
    res.json({ success: true, message: 'Mood comparison retrieved', data: comparison });
});

exports.getRecentActivity = asyncHandler(async (req, res) => {
    const coupleId = getCoupleIdOrThrow(req);
    const recent = await moodService.getRecentActivity({ coupleId });
    res.json({ success: true, message: 'Recent mood activity retrieved', data: recent });
});

// Minimal upset handlers to satisfy frontend requests. These can be expanded
// into a full upset model/service later.
exports.getUpset = asyncHandler(async (req, res) => {
    // For now return an empty array or placeholder list.
    res.json({ success: true, message: 'Upset entries retrieved', data: [] });
});

exports.createUpset = asyncHandler(async (req, res) => {
    // Placeholder implementation - validate minimal fields
    const { pov, reason, note, date } = req.body;
    if (!pov || !reason) return res.status(400).json({ success: false, message: 'pov and reason are required' });
    const created = { id: `tmp_${Date.now()}`, pov, reason, note: note || '', date: date || new Date().toISOString().slice(0, 10) };
    res.status(201).json({ success: true, message: 'Upset entry created (ephemeral)', data: created });
});

exports.deleteUpset = asyncHandler(async (req, res) => {
    // Ephemeral - just return success
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'id required' });
    res.json({ success: true, message: 'Upset entry deleted (ephemeral)', data: { id } });
});
