const LoveNote = require('../models/LoveNote');
const mongoose = require('mongoose');
const User = require('../models/User');
const Couple = require('../models/Couple');

function sendError(res, status, message) {
  return res.status(status).json({ success: false, message });
}

const getValidObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }
  return new mongoose.Types.ObjectId(id);
};

const getOtherPartnerName = async (user) => {
  if (!user || !user.coupleId) return null;
  try {
    const couple = await Couple.findById(user.coupleId).select('partnerA partnerB').lean();
    if (!couple) return null;

    const userIdStr = user._id.toString();
    const otherId = couple.partnerA?.toString() === userIdStr ? couple.partnerB : couple.partnerA;
    if (!otherId) return null;

    const other = await User.findById(otherId).select('name');
    return other?.name || null;
  } catch (err) {
    return null;
  }
};

exports.createNote = async (req, res, next) => {
  try {
    const { title, message, content, mood, favorite } = req.body;
    const noteText = message || content;
    const user = req.user;
    const userId = user && (user.userId || user._id || user.id);
    const userObjectId = getValidObjectId(userId);

    if (!userObjectId) return sendError(res, 401, 'Unauthorized');
    if (!title || !noteText) return sendError(res, 400, 'Title and message are required');
    if (noteText.length > 2000) return sendError(res, 400, 'Message exceeds maximum length (2000)');

    const fromName = user.name || user.email || 'You';
    const otherName = (await getOtherPartnerName(user)) || 'Your partner';

    const note = await LoveNote.create({
      userId: userObjectId,
      from: fromName,
      to: otherName,
      title,
      message: noteText,
      mood,
      favorite: Boolean(favorite),
    });

    return res.status(201).json({ success: true, message: 'Love note created successfully', data: note });
  } catch (err) {
    next(err);
  }
};

exports.getNotes = async (req, res, next) => {
  try {
    const userId = req.user && (req.user.userId || req.user._id || req.user.id);
    const userObjectId = getValidObjectId(userId);
    if (!userObjectId) return sendError(res, 401, 'Unauthorized');

    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '10', 10)));
    const search = (req.query.search || '').trim();

    const filter = { userId: userObjectId };
    if (search) filter.$text = { $search: search };

    const total = await LoveNote.countDocuments(filter);
    const notes = await LoveNote.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return res.json({ success: true, message: 'Love notes retrieved', data: notes, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

exports.searchNotes = async (req, res, next) => {
  try {
    const userId = req.user && (req.user.userId || req.user._id || req.user.id);
    const userObjectId = getValidObjectId(userId);
    if (!userObjectId) return sendError(res, 401, 'Unauthorized');

    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '10', 10)));
    const search = (req.query.q || req.query.search || '').trim();

    const filter = { userId: userObjectId };
    if (search) filter.$text = { $search: search };

    const total = await LoveNote.countDocuments(filter);
    const notes = await LoveNote.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return res.json({ success: true, message: 'Love notes search results', data: notes, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user && (req.user.userId || req.user._id || req.user.id);
    const userObjectId = getValidObjectId(userId);
    if (!userObjectId) return sendError(res, 401, 'Unauthorized');

    const filter = { userId: userObjectId };
    const notes = await LoveNote.find(filter).select('message title createdAt');
    const total = notes.length;

    const words = {};
    const stopWords = new Set(["a", "an", "and", "the", "to", "for", "with", "of", "in", "on", "at", "by", "is", "it", "this", "that"]);
    let longestNoteLength = 0;
    let latestDate = null;
    let totalLength = 0;

    notes.forEach((note) => {
      const text = (note.message || "").toString();
      const length = text.length;
      longestNoteLength = Math.max(longestNoteLength, length);
      totalLength += length;
      latestDate = latestDate ? (note.createdAt > latestDate ? note.createdAt : latestDate) : note.createdAt;

      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word && !stopWords.has(word))
        .forEach((word) => {
          words[word] = (words[word] || 0) + 1;
        });
    });

    const mostUsedWords = Object.entries(words)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word, count]) => ({ word, count }));

    return res.json({
      success: true,
      message: 'Love notes stats retrieved',
      data: {
        total,
        longestNoteLength,
        averageNoteLength: total ? Math.round(totalLength / total) : 0,
        mostUsedWords,
        latestDate,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getNoteById = async (req, res, next) => {
  try {
    const userId = req.user && (req.user.userId || req.user._id || req.user.id);
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, 400, 'Invalid id');
    if (!userId) return sendError(res, 401, 'Unauthorized');

    const userObjectId = getValidObjectId(userId);
    const note = await LoveNote.findOne({ _id: id, userId: userObjectId });
    if (!note) return sendError(res, 404, 'Love note not found');
    if (note.userId.toString() !== userId.toString()) return sendError(res, 403, 'Forbidden');

    return res.json({ success: true, message: 'Love note found', data: note });
  } catch (err) {
    next(err);
  }
};

exports.updateNote = async (req, res, next) => {
  try {
    const user = req.user;
    const userId = user && (user.userId || user._id || user.id);
    const { id } = req.params;
    const { title, message, content, mood, favorite } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, 400, 'Invalid id');
    if (!userId) return sendError(res, 401, 'Unauthorized');

    const userObjectId = getValidObjectId(userId);
    const note = await LoveNote.findOne({ _id: id, userId: userObjectId });
    if (!note) return sendError(res, 404, 'Love note not found');
    if (note.userId.toString() !== userId.toString()) return sendError(res, 403, 'Forbidden');

    if (title !== undefined) {
      if (!title) return sendError(res, 400, 'Title cannot be empty');
      note.title = title;
    }

    const noteText = message || content;

    if (message !== undefined || content !== undefined) {
      if (!noteText) return sendError(res, 400, 'Message cannot be empty');
      if (noteText.length > 2000) return sendError(res, 400, 'Message exceeds maximum length (2000)');
      note.message = noteText;
    }

    // Ensure `from` is always the current user name, and `to` is computed from couple membership.
    note.from = user.name || user.email || note.from;
    const otherName = (await getOtherPartnerName(user)) || note.to || 'Your partner';
    note.to = otherName;
    if (mood !== undefined) note.mood = mood;
    if (favorite !== undefined) note.favorite = Boolean(favorite);

    await note.save();
    return res.json({ success: true, message: 'Love note updated', data: note });
  } catch (err) {
    next(err);
  }
};

exports.deleteNote = async (req, res, next) => {
  try {
    const userId = req.user && (req.user.userId || req.user._id || req.user.id);
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, 400, 'Invalid id');
    if (!userId) return sendError(res, 401, 'Unauthorized');

    const userObjectId = getValidObjectId(userId);
    const note = await LoveNote.findOne({ _id: id, userId: userObjectId });
    if (!note) return sendError(res, 404, 'Love note not found');
    if (note.userId.toString() !== userId.toString()) return sendError(res, 403, 'Forbidden');

    await note.remove();
    return res.json({ success: true, message: 'Love note deleted' });
  } catch (err) {
    next(err);
  }
};
