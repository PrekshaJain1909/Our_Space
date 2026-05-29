const BucketTask = require('../models/BucketTask');
const mongoose = require('mongoose');

const getValidObjectId = (id) => {
  if (!id) return null;
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return new mongoose.Types.ObjectId(id);
};

function sendError(res, status, message) {
  return res.status(status).json({ success: false, message });
}

function computeStatusForDate(targetDate) {
  if (!targetDate) return 'pending';
  const now = new Date();
  const diff = (new Date(targetDate) - now) / (1000 * 60 * 60 * 24);
  if (diff < 0) return 'overdue';
  if (diff <= 7) return 'approaching';
  return 'pending';
}

exports.create = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return sendError(res, 401, 'Unauthorized');

    const { title, category, targetDate, assignedTo, notes } = req.body;
    if (!title || !title.toString().trim()) return sendError(res, 400, 'Title required');

    const coupleId = getValidObjectId(user.coupleId);

    const status = computeStatusForDate(targetDate);

    const task = await BucketTask.create({
      title: title.toString().trim(),
      category: category || 'general',
      targetDate: targetDate ? new Date(targetDate) : null,
      assignedTo: assignedTo || null,
      notes: notes || '',
      status,
      createdBy: getValidObjectId(user.userId || user._id || user.id),
      coupleId,
    });

    try { const io = req.app && req.app.get && req.app.get('io'); if (io && coupleId) io.to(`couple:${coupleId.toString()}`).emit('bucket:created', task); } catch (e) {}

    return res.status(201).json({ success: true, message: 'Bucket task created', data: task });
  } catch (err) { next(err); }
};

exports.getAll = async (req, res, next) => {
  try {
    const user = req.user; if (!user) return sendError(res, 401, 'Unauthorized');
    const coupleId = getValidObjectId(user.coupleId);
    if (!coupleId) return sendError(res, 400, 'Invalid coupleId');

    const tasks = await BucketTask.find({ coupleId }).sort({ targetDate: 1, createdAt: -1 }).lean();

    // compute dynamic statuses
    const updated = tasks.map((t) => ({
      ...t,
      status: computeStatusForDate(t.targetDate) === 'completed' ? t.status : computeStatusForDate(t.targetDate),
    }));

    return res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params; if (!getValidObjectId(id)) return sendError(res, 400, 'Invalid id');
    const task = await BucketTask.findById(id).lean(); if (!task) return sendError(res, 404, 'Not found');
    const user = req.user; if (!user) return sendError(res, 401, 'Unauthorized');
    if (task.coupleId && task.coupleId.toString() !== (user.coupleId || '').toString()) return sendError(res, 403, 'Forbidden');

    // compute dynamic status
    task.status = computeStatusForDate(task.targetDate) === 'completed' ? task.status : computeStatusForDate(task.targetDate);

    return res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

exports.complete = async (req, res, next) => {
  try {
    const { id } = req.params; if (!getValidObjectId(id)) return sendError(res, 400, 'Invalid id');
    const task = await BucketTask.findById(id); if (!task) return sendError(res, 404, 'Not found');
    const user = req.user; if (!user) return sendError(res, 401, 'Unauthorized');
    if (task.coupleId && task.coupleId.toString() !== (user.coupleId || '').toString()) return sendError(res, 403, 'Forbidden');

    task.isCompleted = true;
    task.completedAt = new Date();
    task.status = 'completed';
    await task.save();

    try { const io = req.app && req.app.get && req.app.get('io'); if (io && task.coupleId) io.to(`couple:${task.coupleId.toString()}`).emit('bucket:updated', task); } catch (e) {}

    return res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

exports.restore = async (req, res, next) => {
  try {
    const { id } = req.params; if (!getValidObjectId(id)) return sendError(res, 400, 'Invalid id');
    const task = await BucketTask.findById(id); if (!task) return sendError(res, 404, 'Not found');
    const user = req.user; if (!user) return sendError(res, 401, 'Unauthorized');
    if (task.coupleId && task.coupleId.toString() !== (user.coupleId || '').toString()) return sendError(res, 403, 'Forbidden');

    task.isCompleted = false;
    task.completedAt = null;
    task.status = computeStatusForDate(task.targetDate);
    await task.save();

    try { const io = req.app && req.app.get && req.app.get('io'); if (io && task.coupleId) io.to(`couple:${task.coupleId.toString()}`).emit('bucket:updated', task); } catch (e) {}

    return res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params; if (!getValidObjectId(id)) return sendError(res, 400, 'Invalid id');
    const task = await BucketTask.findById(id); if (!task) return sendError(res, 404, 'Not found');
    const user = req.user; if (!user) return sendError(res, 401, 'Unauthorized');
    if (task.coupleId && task.coupleId.toString() !== (user.coupleId || '').toString()) return sendError(res, 403, 'Forbidden');

    await task.remove();
    try { const io = req.app && req.app.get && req.app.get('io'); if (io && task.coupleId) io.to(`couple:${task.coupleId.toString()}`).emit('bucket:deleted', { _id: id }); } catch (e) {}

    return res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

exports.filterByStatus = async (req, res, next) => {
  try {
    const user = req.user; if (!user) return sendError(res, 401, 'Unauthorized');
    const coupleId = getValidObjectId(user.coupleId); if (!coupleId) return sendError(res, 400, 'Invalid coupleId');
    const { status } = req.params;
    const filter = { coupleId };
    if (status && status !== 'all') filter.status = status;
    const items = await BucketTask.find(filter).sort({ targetDate: 1, createdAt: -1 }).lean();
    return res.json({ success: true, data: items });
  } catch (err) { next(err); }
};
