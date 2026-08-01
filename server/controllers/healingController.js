const Healing = require('../models/Healing');
const mongoose = require('mongoose');
const User = require('../models/User');
const Couple = require('../models/Couple');

function sendError(res, status, message, reason = null) {
  if (reason) {
    console.warn(`[healing] ${reason}`);
  }
  return res.status(status).json({ success: false, message });
}

const getValidObjectId = (id) => {
  if (!id) return null;
  if (id instanceof mongoose.Types.ObjectId) return id;
  if (typeof id === 'string' || typeof id === 'number') {
    const value = id.toString();
    if (!mongoose.Types.ObjectId.isValid(value)) return null;
    return new mongoose.Types.ObjectId(value);
  }
  if (id?.toString) {
    const value = id.toString();
    if (!mongoose.Types.ObjectId.isValid(value)) return null;
    return new mongoose.Types.ObjectId(value);
  }
  return null;
};

const getCouplePartnerIds = async (user) => {
  if (!user || !user.coupleId) return null;
  try {
    const couple = await Couple.findById(user.coupleId).select('partnerA partnerB').lean();
    if (!couple) return null;
    return {
      partnerA: couple.partnerA,
      partnerB: couple.partnerB,
    };
  } catch (err) {
    return null;
  }
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

const getCurrentPartnerId = async (user) => {
  const ids = await getCouplePartnerIds(user);
  if (!ids) return null;
  const userIdStr = user._id?.toString?.();
  if (ids.partnerA?.toString() === userIdStr) return ids.partnerB;
  if (ids.partnerB?.toString() === userIdStr) return ids.partnerA;
  return null;
};

const getPartnerName = async (user, partnerId) => {
  if (!partnerId) return null;
  try {
    const partner = await User.findById(partnerId).select('name');
    return partner?.name || null;
  } catch (err) {
    return null;
  }
};

const canModifyPromise = (entry, userId) => {
  if (!entry || !userId) return false;
  const creatorId = entry.createdBy?.toString?.();
  const assignedTo = entry.assignedTo?.toString?.();
  return creatorId === userId || assignedTo === userId;
};

exports.createEntry = async (req, res, next) => {
  try {
    console.log('[healing:createEntry] req.user:', req.user && {
      id: req.user._id?.toString?.(),
      userId: req.user.userId,
      coupleId: req.user.coupleId?.toString?.(),
      role: req.user.role,
    });
    console.log('[healing:createEntry] request body:', req.body);
    console.log('[healing:createEntry] params:', req.params);
    // Accept multiple client payload shapes (legacy keys from frontend)
    const {
      title: bodyTitle,
      message,
      content,
      mood,
      category,
      favorite,
      type,
      assignedTo,
      dueDate,
      status,
      accepted,
      acceptedAt,
      declinedAt,
      fulfilledAt,
      brokenAt,
      // legacy names
      apologizer,
      forgiver,
      reason,
      punishment,
      promiseText,
      description,
      note,
    } = req.body;

    console.log('[healing:createEntry] normalized fields:', { reason, punishment, description, title: bodyTitle, message });

    const normalizedReason = (reason || bodyTitle || promiseText || '').toString().trim();
    const normalizedPunishment = (punishment || '').toString().trim();
    const normalizedDescription = (description || message || content || note || '').toString().trim();
    const title = bodyTitle || normalizedReason || normalizedPunishment || promiseText || 'Untitled';
    const noteText = normalizedDescription || (message || content || note || normalizedReason || normalizedPunishment || promiseText || '').toString().trim();
    const user = req.user;
    const userId = user && (user.userId || user._id || user.id);
    const userObjectId = getValidObjectId(userId);

    if (!user) {
      return sendError(res, 401, 'Authentication required. Please log in again.', 'createEntry missing req.user');
    }

    if (!userObjectId) {
      console.warn('[healing:createEntry] authentication failed: unable to resolve user id', { userId, rawUserId: userId });
      return sendError(res, 401, 'Unable to resolve authenticated user. Please log in again.', 'createEntry invalid user id');
    }
    if (!title || !normalizedReason) {
      console.warn('[healing:createEntry] validation failed', { title, noteText, normalizedReason, normalizedPunishment, normalizedDescription });
      return sendError(res, 400, 'Reason is required');
    }
    if (noteText.length > 5000) return sendError(res, 400, 'Message exceeds maximum length (5000)');

    const fromName = user.name || user.email || 'You';
    const otherName = (await getOtherPartnerName(user)) || 'Your partner';
    const normalizedAssignedTo = getValidObjectId(assignedTo);

    if (assignedTo && !normalizedAssignedTo) {
      console.warn('[healing:createEntry] invalid assignedTo provided, ignoring it', assignedTo);
    }

    const entryData = {
      coupleId: user.coupleId || null,
      userId: userObjectId,
      createdBy: userObjectId,
      from: fromName,
      to: otherName,
      type: type || (promiseText ? 'promise' : punishment ? 'punishment' : 'mistake'),
      status: status || (promiseText ? 'pending' : 'pending'),
      accepted: Boolean(accepted),
      acceptedAt: acceptedAt ? new Date(acceptedAt) : null,
      declinedAt: declinedAt ? new Date(declinedAt) : null,
      fulfilledAt: fulfilledAt ? new Date(fulfilledAt) : null,
      brokenAt: brokenAt ? new Date(brokenAt) : null,
      reason: normalizedReason,
      punishment: normalizedPunishment,
      description: normalizedDescription,
      title,
      message: noteText,
      mood,
      category,
      assignedTo: normalizedAssignedTo || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      favorite: Boolean(favorite),
      autoGenerated: req.body.autoGenerated !== undefined ? Boolean(req.body.autoGenerated) : false,
    };

    console.log('[healing:createEntry] entry before save:', entryData);

    const entry = await Healing.create(entryData);

    console.log('[healing:createEntry] save success', { id: entry._id, type: entry.type });
    console.log('[healing:createEntry] saved entry:', entry);

    // Emit socket event for real-time updates (if socket.io attached)
    try {
      const io = req.app && req.app.get && req.app.get('io');
      if (io && entry && entry.coupleId) {
        io.to(`couple:${entry.coupleId}`).emit('healing:created', entry);
        io.to(`couple:${entry.coupleId}`).emit('healing:statsUpdated', { coupleId: entry.coupleId });
      }
    } catch (emitErr) {
      console.warn('[healing] socket emit failed:', emitErr && emitErr.message);
    }

    return res.status(201).json({ success: true, message: 'Healing entry created successfully', data: entry });
  } catch (err) {
    next(err);
  }
};

exports.getEntries = async (req, res, next) => {
  try {
    console.log('[healing:getEntries] user:', req.user);
    console.log('[healing:getEntries] query:', req.query);
    const userId = req.user && (req.user.userId || req.user._id || req.user.id);
    const userObjectId = getValidObjectId(userId);
    if (!userObjectId) return sendError(res, 401, 'Unauthorized');

    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '10', 10)));
    const search = (req.query.search || '').trim();

    // Support filters from frontend
    const { type, status, person, fromDate, toDate } = req.query;

    const filter = {};
    if (req.user && req.user.coupleId) filter.coupleId = req.user.coupleId;
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (person) {
      // Accept either ObjectId or string; convert when valid
      if (mongoose.Types.ObjectId.isValid(person)) {
        const p = new mongoose.Types.ObjectId(person);
        filter.$or = [{ createdBy: p }, { assignedTo: p }];
      } else {
        filter.$or = [{ createdBy: person }, { assignedTo: person }];
      }
    }
    if (fromDate || toDate) filter.createdAt = {};
    if (fromDate) filter.createdAt.$gte = new Date(fromDate);
    if (toDate) filter.createdAt.$lte = new Date(toDate);
    if (search) filter.$text = { $search: search };

    const total = await Healing.countDocuments(filter);
    const entries = await Healing.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    console.log('[healing:getEntries] entries:', entries);

    return res.json({ success: true, message: 'Healing entries retrieved', data: entries, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

exports.searchEntries = async (req, res, next) => {
  try {
    console.log('[healing:searchEntries] user:', req.user);
    console.log('[healing:searchEntries] query:', req.query);
    const userId = req.user && (req.user.userId || req.user._id || req.user.id);
    const userObjectId = getValidObjectId(userId);
    if (!userObjectId) return sendError(res, 401, 'Unauthorized');

    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '10', 10)));
    const search = (req.query.q || req.query.search || '').trim();

    const { type, status, person } = req.query;
    const filter = {};
    if (req.user && req.user.coupleId) filter.coupleId = req.user.coupleId;
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (person) {
      if (mongoose.Types.ObjectId.isValid(person)) {
        const p = new mongoose.Types.ObjectId(person);
        filter.$or = [{ createdBy: p }, { assignedTo: p }];
      } else {
        filter.$or = [{ createdBy: person }, { assignedTo: person }];
      }
    }
    if (search) filter.$text = { $search: search };

    const total = await Healing.countDocuments(filter);
    const entries = await Healing.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return res.json({ success: true, message: 'Healing entries search results', data: entries, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user && (req.user.userId || req.user._id || req.user.id);
    const userObjectId = getValidObjectId(userId);
    if (!req.user) return sendError(res, 401, 'Authentication required. Please log in again.', 'getStats missing req.user');
    if (!userObjectId) return sendError(res, 401, 'Unable to resolve authenticated user. Please log in again.', 'getStats invalid user id');

    const filter = { userId: userObjectId };
    const entries = await Healing.find(filter).select('message title createdAt');
    const total = entries.length;

    const words = {};
    const stopWords = new Set(["a", "an", "and", "the", "to", "for", "with", "of", "in", "on", "at", "by", "is", "it", "this", "that"]);
    let longestEntryLength = 0;
    let latestDate = null;
    let totalLength = 0;

    entries.forEach((entry) => {
      const text = (entry.message || "").toString();
      const length = text.length;
      longestEntryLength = Math.max(longestEntryLength, length);
      totalLength += length;
      latestDate = latestDate ? (entry.createdAt > latestDate ? entry.createdAt : latestDate) : entry.createdAt;

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
      message: 'Healing entries stats retrieved',
      data: {
        total,
        longestEntryLength,
        averageEntryLength: total ? Math.round(totalLength / total) : 0,
        mostUsedWords,
        latestDate,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getEntryById = async (req, res, next) => {
  try {
    console.log('[healing:getEntryById] user:', req.user);
    console.log('[healing:getEntryById] params:', req.params);
    const userId = req.user && (req.user.userId || req.user._id || req.user.id);
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, 400, 'Invalid id');
    if (!userId) return sendError(res, 401, 'Unauthorized');

    const entry = await Healing.findOne({ _id: id, coupleId: req.user?.coupleId });
    if (!entry) return sendError(res, 404, 'Healing entry not found');
    if (entry.userId.toString() !== userId.toString()) return sendError(res, 403, 'Forbidden');

    console.log('[healing:getEntryById] entry:', entry);

    return res.json({ success: true, message: 'Healing entry found', data: entry });
  } catch (err) {
    next(err);
  }
};

exports.updateEntry = async (req, res, next) => {
  try {
    console.log('[healing:updateEntry] user:', req.user);
    console.log('[healing:updateEntry] body:', req.body);
    console.log('[healing:updateEntry] params:', req.params);
    const user = req.user;
    const userId = user && (user.userId || user._id || user.id);
    const { id } = req.params;
    const { title, message, content, reason, punishment, description, status, mood, category, favorite } = req.body;

    console.log('[healing:updateEntry] normalized fields:', { reason, punishment, description, status, title, message, content });

    if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, 400, 'Invalid id');
    if (!userId) return sendError(res, 401, 'Unauthorized');

    const entry = await Healing.findOne({ _id: id, coupleId: req.user?.coupleId });
    if (!entry) return sendError(res, 404, 'Healing entry not found');
    if (entry.userId.toString() !== userId.toString()) return sendError(res, 403, 'Forbidden');

    if (title !== undefined) {
      if (!title) return sendError(res, 400, 'Title cannot be empty');
      entry.title = title;
    }

    if (reason !== undefined) {
      if (!reason) return sendError(res, 400, 'Reason cannot be empty');
      entry.reason = reason;
      entry.title = reason;
    }

    if (punishment !== undefined) {
      entry.punishment = punishment;
    }

    if (description !== undefined) {
      entry.description = description;
    }

    if (status !== undefined) {
      const normalizedStatus = String(status);
      if (!['pending', 'active', 'completed', 'broken', 'declined', 'forgiven', 'overdue', 'cancelled'].includes(normalizedStatus)) {
        return sendError(res, 400, 'Invalid status');
      }
      entry.status = normalizedStatus;
      if (normalizedStatus === 'completed') {
        entry.metadata = entry.metadata || {};
        entry.metadata.completedAt = new Date();
        entry.fulfilledAt = new Date();
      } else if (normalizedStatus === 'broken') {
        entry.metadata = entry.metadata || {};
        entry.metadata.brokenAt = new Date();
        entry.brokenAt = new Date();
      } else if (normalizedStatus === 'declined') {
        entry.metadata = entry.metadata || {};
        entry.metadata.declinedAt = new Date();
        entry.declinedAt = new Date();
      } else if (normalizedStatus === 'pending') {
        entry.accepted = false;
        delete entry.acceptedAt;
        delete entry.declinedAt;
        delete entry.brokenAt;
        delete entry.fulfilledAt;
      }
    }

    const noteText = description !== undefined ? description : (message || content);

    if (message !== undefined || content !== undefined) {
      if (!noteText) return sendError(res, 400, 'Message cannot be empty');
      if (noteText.length > 5000) return sendError(res, 400, 'Message exceeds maximum length (5000)');
      entry.message = noteText;
    }

    if (description !== undefined) {
      entry.message = description || entry.message || entry.reason || entry.title || '';
    }

    console.log('[healing:updateEntry] entry before save:', entry);

    entry.from = user.name || user.email || entry.from;
    const otherName = (await getOtherPartnerName(user)) || entry.to || 'Your partner';
    entry.to = otherName;
    if (mood !== undefined) entry.mood = mood;
    if (category !== undefined) entry.category = category;
    if (favorite !== undefined) entry.favorite = Boolean(favorite);

    await entry.save();
    console.log('[healing:updateEntry] saved entry:', entry);
    // Emit update event
    try {
      const io = req.app && req.app.get && req.app.get('io');
      if (io && entry && entry.coupleId) {
        io.to(`couple:${entry.coupleId}`).emit('healing:updated', entry);
        io.to(`couple:${entry.coupleId}`).emit('healing:statsUpdated', { coupleId: entry.coupleId });
      }
    } catch (emitErr) {
      console.warn('[healing] socket emit failed (update):', emitErr && emitErr.message);
    }

    return res.json({ success: true, message: 'Healing entry updated', data: entry });
  } catch (err) {
    next(err);
  }
};

exports.deleteEntry = async (req, res, next) => {
  try {
    console.log('[healing:deleteEntry] user:', req.user);
    console.log('[healing:deleteEntry] params:', req.params);
    const userId = req.user && (req.user.userId || req.user._id || req.user.id);
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, 400, 'Invalid id');
    if (!userId) return sendError(res, 401, 'Unauthorized');

    const entry = await Healing.findOne({ _id: id, coupleId: req.user?.coupleId });
    if (!entry) return sendError(res, 404, 'Healing entry not found');
    if (entry.userId.toString() !== userId.toString()) return sendError(res, 403, 'Forbidden');

    await entry.deleteOne();
    // Emit delete event
    try {
      const io = req.app && req.app.get && req.app.get('io');
      if (io && entry && entry.coupleId) {
        io.to(`couple:${entry.coupleId}`).emit('healing:deleted', { id: entry._id });
        io.to(`couple:${entry.coupleId}`).emit('healing:statsUpdated', { coupleId: entry.coupleId });
      }
    } catch (emitErr) {
      console.warn('[healing] socket emit failed (delete):', emitErr && emitErr.message);
    }

    return res.json({ success: true, message: 'Entry deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// --- Convenience endpoints used by frontend (/entries, /promises, /forgiveness) ---
exports.createPromiseRequest = async (req, res, next) => {
  try {
    req.body.type = 'promise';
    req.body.status = 'pending';
    req.body.accepted = false;

    // Ensure the request specifies recipient and creator names
    const user = req.user;
    const userId = user && (user.userId || user._id || user.id);
    const creatorName = user?.name || user?.email || 'You';
    const partnerId = await getCurrentPartnerId(user);
    const partnerName = await getPartnerName(user, partnerId) || 'Your partner';

    req.body.from = creatorName;
    req.body.to = partnerName;
    req.body.createdBy = getValidObjectId(userId);
    req.body.assignedTo = getValidObjectId(partnerId);

    return exports.createEntry(req, res, next);
  } catch (err) { next(err); }
};

exports.createPromise = async (req, res, next) => {
  try {
    req.body.type = 'promise';
    return exports.createEntry(req, res, next);
  } catch (err) { next(err); }
};

exports.getPromises = async (req, res, next) => {
  try {
    req.query.type = 'promise';
    req.query.limit = req.query.limit || '100';
    return exports.getEntries(req, res, next);
  } catch (err) { next(err); }
};

const emitPromiseUpdated = async (app, entry) => {
  try {
    const io = app && app.get && app.get('io');
    if (io && entry && entry.coupleId) {
      io.to(`couple:${entry.coupleId}`).emit('healing:updated', entry);
      io.to(`couple:${entry.coupleId}`).emit('healing:statsUpdated', { coupleId: entry.coupleId });
      io.to(`couple:${entry.coupleId}`).emit('promise:updated', entry);
    }
  } catch (emitErr) {
    console.warn('[healing] socket emit failed (promise updated):', emitErr && emitErr.message);
  }
};

exports.acceptPromise = async (req, res, next) => {
  try {
    const userId = req.user && (req.user.userId || req.user._id || req.user.id);
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, 400, 'Invalid promise id');
    if (!userId) return sendError(res, 401, 'Unauthorized');

    const entry = await Healing.findOne({ _id: id, coupleId: req.user?.coupleId });
    if (!entry) return sendError(res, 404, 'Promise request not found');
    if (entry.type !== 'promise') return sendError(res, 400, 'Not a promise request');
    if (entry.status !== 'pending') return sendError(res, 400, 'Promise request is not pending');
    if (!entry.assignedTo || entry.assignedTo.toString() !== userId.toString()) return sendError(res, 403, 'Only the requested partner can accept this promise');

    entry.status = 'active';
    entry.accepted = true;
    entry.acceptedAt = new Date();
    await entry.save();

    await emitPromiseUpdated(req.app, entry);

    return res.json({ success: true, message: 'Promise accepted', data: entry });
  } catch (err) { next(err); }
};

exports.declinePromise = async (req, res, next) => {
  try {
    const userId = req.user && (req.user.userId || req.user._id || req.user.id);
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, 400, 'Invalid promise id');
    if (!userId) return sendError(res, 401, 'Unauthorized');

    const entry = await Healing.findOne({ _id: id, coupleId: req.user?.coupleId });
    if (!entry) return sendError(res, 404, 'Promise request not found');
    if (entry.type !== 'promise') return sendError(res, 400, 'Not a promise request');
    if (entry.status !== 'pending') return sendError(res, 400, 'Promise request is not pending');
    if (!entry.assignedTo || entry.assignedTo.toString() !== userId.toString()) return sendError(res, 403, 'Only the requested partner can decline this promise');

    entry.status = 'declined';
    entry.declinedAt = new Date();
    await entry.save();

    await emitPromiseUpdated(req.app, entry);

    return res.json({ success: true, message: 'Promise declined', data: entry });
  } catch (err) { next(err); }
};

exports.breakPromise = async (req, res, next) => {
  try {
    const userId = req.user && (req.user.userId || req.user._id || req.user.id);
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, 400, 'Invalid promise id');
    if (!userId) return sendError(res, 401, 'Unauthorized');

    const entry = await Healing.findOne({ _id: id, coupleId: req.user?.coupleId });
    if (!entry) return sendError(res, 404, 'Promise not found');
    if (entry.type !== 'promise') return sendError(res, 400, 'Not a promise');
    if (entry.status !== 'active') return sendError(res, 400, 'Only active promises can be broken');
    if (!canModifyPromise(entry, userId)) return sendError(res, 403, 'Forbidden');

    entry.status = 'broken';
    entry.brokenAt = new Date();
    await entry.save();

    await emitPromiseUpdated(req.app, entry);

    return res.json({ success: true, message: 'Promise marked as broken', data: entry });
  } catch (err) { next(err); }
};

exports.requestBreakPromise = async (req, res, next) => {
  try {
    const userId = req.user && (req.user.userId || req.user._id || req.user.id);
    const { id } = req.params;
    const { reason } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, 400, 'Invalid promise id');
    if (!userId) return sendError(res, 401, 'Unauthorized');

    const entry = await Healing.findOne({ _id: id, coupleId: req.user?.coupleId });
    if (!entry) return sendError(res, 404, 'Promise not found');
    if (entry.type !== 'promise') return sendError(res, 400, 'Not a promise');
    if (entry.status !== 'active') return sendError(res, 400, 'Only active promises can be broken');

    entry.status = 'break_requested';
    entry.breakRequestedBy = getValidObjectId(userId);
    entry.breakReason = (reason || '').toString().trim();
    await entry.save();

    await emitPromiseUpdated(req.app, entry);

    return res.json({ success: true, message: 'Promise break requested', data: entry });
  } catch (err) { next(err); }
};

exports.agreeBreakPromise = async (req, res, next) => {
  try {
    const userId = req.user && (req.user.userId || req.user._id || req.user.id);
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, 400, 'Invalid promise id');
    if (!userId) return sendError(res, 401, 'Unauthorized');

    const entry = await Healing.findOne({ _id: id, coupleId: req.user?.coupleId });
    if (!entry) return sendError(res, 404, 'Promise not found');
    if (entry.type !== 'promise') return sendError(res, 400, 'Not a promise');
    if (entry.status !== 'break_requested') return sendError(res, 400, 'Break was not requested for this promise');

    entry.status = 'broken';
    entry.brokenAt = new Date();
    entry.breakApprovedBy = getValidObjectId(userId);
    await entry.save();

    await emitPromiseUpdated(req.app, entry);

    return res.json({ success: true, message: 'Promise marked as broken (agreed)', data: entry });
  } catch (err) { next(err); }
};

exports.disagreeBreakPromise = async (req, res, next) => {
  try {
    const userId = req.user && (req.user.userId || req.user._id || req.user.id);
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, 400, 'Invalid promise id');
    if (!userId) return sendError(res, 401, 'Unauthorized');

    const entry = await Healing.findOne({ _id: id, coupleId: req.user?.coupleId });
    if (!entry) return sendError(res, 404, 'Promise not found');
    if (entry.type !== 'promise') return sendError(res, 400, 'Not a promise');
    if (entry.status !== 'break_requested') return sendError(res, 400, 'Break was not requested for this promise');

    entry.status = 'active'; // returns back to accepted (active)
    entry.disputed = true;
    if (!entry.metadata) entry.metadata = {};
    entry.metadata.disputed = true;
    await entry.save();

    await emitPromiseUpdated(req.app, entry);

    return res.json({ success: true, message: 'Promise break request rejected (disagreed)', data: entry });
  } catch (err) { next(err); }
};

exports.fulfillPromise = async (req, res, next) => {
  try {
    console.log('[healing:fulfillPromise] user:', req.user);
    console.log('[healing:fulfillPromise] params:', req.params);
    const userId = req.user && (req.user.userId || req.user._id || req.user.id);
    if (!userId) return sendError(res, 401, 'Unauthorized');
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, 400, 'Invalid id');

    const entry = await Healing.findOne({ _id: id, coupleId: req.user?.coupleId });
    if (!entry) return sendError(res, 404, 'Promise not found');
    if (entry.coupleId && req.user.coupleId && entry.coupleId.toString() !== req.user.coupleId.toString()) return sendError(res, 403, 'Forbidden');

    entry.status = 'completed';
    entry.metadata = entry.metadata || {};
    entry.metadata.completedAt = new Date();
    entry.fulfilledAt = new Date();
    await entry.save();

    // Emit complete event
    try {
      const io = req.app && req.app.get && req.app.get('io');
      if (io && entry && entry.coupleId) {
        io.to(`couple:${entry.coupleId}`).emit('healing:updated', entry);
        io.to(`couple:${entry.coupleId}`).emit('healing:statsUpdated', { coupleId: entry.coupleId });
      }
    } catch (emitErr) {
      console.warn('[healing] socket emit failed (complete):', emitErr && emitErr.message);
    }

    return res.json({ success: true, message: 'Promise fulfilled', data: entry });
  } catch (err) { next(err); }
};

exports.createForgiveness = async (req, res, next) => {
  try {
    // Create a forgiveness record and optionally update original entry
    const { originalEntryId, message } = req.body;
    // Create forgiveness entry as a Healing item
    req.body.type = 'forgiveness';
    req.body.title = req.body.title || 'Forgiveness';
    req.body.message = message || '';

    console.log('[healing:createForgiveness] user:', req.user && req.user._id, 'body:', req.body);

    const resCreate = await exports.createEntry(req, res, next);

    // If originalEntryId provided, update its status
    if (originalEntryId && mongoose.Types.ObjectId.isValid(originalEntryId)) {
      const orig = await Healing.findOne({ _id: originalEntryId, coupleId: req.user?.coupleId });
      if (orig && orig.coupleId && req.user.coupleId && orig.coupleId.toString() === req.user.coupleId.toString()) {
        orig.status = 'forgiven';
        orig.metadata = orig.metadata || {};
        orig.metadata.forgivenessMessage = message || '';
        orig.metadata.forgivenAt = new Date();
        await orig.save();
        console.log('[healing:createForgiveness] updated original entry id:', orig._id);
        // Emit update for original entry
        try {
          const io = req.app && req.app.get && req.app.get('io');
          if (io && orig && orig.coupleId) {
            io.to(`couple:${orig.coupleId}`).emit('healing:updated', orig);
            io.to(`couple:${orig.coupleId}`).emit('healing:statsUpdated', { coupleId: orig.coupleId });
          }
        } catch (emitErr) {
          console.warn('[healing] socket emit failed (forgiveness orig update):', emitErr && emitErr.message);
        }
      } else {
        console.warn('[healing:createForgiveness] original entry not found or forbidden:', originalEntryId);
      }
    }

    // Note: createEntry already sent response; nothing more to do
    return null;
  } catch (err) { next(err); }
};

exports.getForgiveness = async (req, res, next) => {
  try {
    req.query.type = 'forgiveness';
    return exports.getEntries(req, res, next);
  } catch (err) { next(err); }
};
