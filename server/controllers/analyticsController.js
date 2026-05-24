const Habit = require('../models/Habit');
const mongoose = require('mongoose');

const sendError = (res, status, message) => res.status(status).json({ success: false, message });

exports.getHabits = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || !user.coupleId) return sendError(res, 401, 'Unauthorized');

    const items = await Habit.find({ coupleId: user.coupleId }).sort({ createdAt: -1 }).exec();
    return res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

exports.createHabit = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || !user.coupleId) return sendError(res, 401, 'Unauthorized');

    const { name, category, ownerId, ownerName } = req.body;
    if (!name) return sendError(res, 400, 'Name required');

    const doc = await Habit.create({
      coupleId: user.coupleId,
      name: name.toString().slice(0,200),
      category: (category || 'general').toString().slice(0,100),
      ownerId: ownerId && mongoose.Types.ObjectId.isValid(ownerId) ? ownerId : undefined,
      ownerName: ownerName || undefined,
      createdBy: user._id
    });

    return res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

exports.updateHabit = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || !user.coupleId) return sendError(res, 401, 'Unauthorized');
    const id = req.params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return sendError(res, 400, 'Invalid id');

    const habit = await Habit.findById(id);
    if (!habit) return sendError(res, 404, 'Not found');
    if (habit.coupleId.toString() !== user.coupleId.toString()) return sendError(res, 403, 'Forbidden');

    // Allow partial updates (name, category, ownerId, ownerName, collapsed, history)
    const allowed = ['name','category','ownerId','ownerName','collapsed','history'];
    allowed.forEach(k => { if (typeof req.body[k] !== 'undefined') habit[k] = req.body[k]; });
    await habit.save();
    return res.json({ success: true, data: habit });
  } catch (err) { next(err); }
};

exports.deleteHabit = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || !user.coupleId) return sendError(res, 401, 'Unauthorized');
    const id = req.params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return sendError(res, 400, 'Invalid id');

    const habit = await Habit.findById(id);
    if (!habit) return sendError(res, 404, 'Not found');
    if (habit.coupleId.toString() !== user.coupleId.toString()) return sendError(res, 403, 'Forbidden');

    await habit.remove();
    return res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

// Add or replace a history entry for a habit
exports.upsertEntry = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || !user.coupleId) return sendError(res, 401, 'Unauthorized');
    const id = req.params.id;
    const { entry } = req.body;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return sendError(res, 400, 'Invalid id');
    if (!entry || !entry.id) return sendError(res, 400, 'Missing entry');

    const habit = await Habit.findById(id);
    if (!habit) return sendError(res, 404, 'Not found');
    if (habit.coupleId.toString() !== user.coupleId.toString()) return sendError(res, 403, 'Forbidden');

    // Ensure only owner (if set) can edit entries
    if (habit.ownerId && habit.ownerId.toString() !== user._id.toString()) return sendError(res, 403, 'Only the owner can modify entries');

    const existingIdx = habit.history.findIndex(h => h.id === entry.id);
    if (entry === null) {
      // delete entry
      if (existingIdx >= 0) habit.history.splice(existingIdx, 1);
    } else {
      const payload = {
        id: entry.id,
        date: entry.date,
        count: Number(entry.count || 0),
        status: entry.status || '',
        note: entry.note || '',
        createdAt: entry.createdAt ? new Date(entry.createdAt) : new Date(),
        updatedById: user._id,
        updatedByName: user.name || ''
      };

      if (existingIdx >= 0) {
        habit.history[existingIdx] = payload;
      } else {
        habit.history.unshift(payload);
      }
    }

    await habit.save();
    return res.json({ success: true, data: habit });
  } catch (err) { next(err); }
};
