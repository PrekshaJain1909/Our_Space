const mongoose = require('mongoose');
const punishmentService = require('../services/punishmentService');
const PunishmentHistory = require('../models/PunishmentHistory');
const PunishmentTemplate = require('../models/PunishmentTemplate');
const Punishment = require('../models/Punishment');
const GeneratedPunishment = require('../models/GeneratedPunishment');

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

exports.generate = async (req, res, next) => {
  try {
    const coupleId = req.user.coupleId;
    const generatedBy = req.user._id;
    const { level, mood, tags } = req.query;

    const result = await punishmentService.generate({ coupleId, generatedBy, level, mood, tags: tags ? tags.split(',') : [] });
    return res.json({ success: true, message: 'Punishment generated', data: { text: result.text, template: result.template } });
  } catch (err) {
    next(err);
  }
};

exports.generateAndSave = async (req, res, next) => {
  try {
    const coupleId = req.user.coupleId;
    const generatedBy = req.user._id;
    const { level, mood, tags, entryId } = req.body;

    const result = await punishmentService.generateAndSave({ coupleId, generatedBy, level, mood, tags: tags || [], entryId });
    return res.status(201).json({ success: true, message: 'Punishment generated and saved', data: { text: result.text, history: result.history } });
  } catch (err) {
    next(err);
  }
};

exports.history = async (req, res, next) => {
  try {
    const coupleId = req.user.coupleId;
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '20', 10)));

    const filter = { coupleId };
    const total = await PunishmentHistory.countDocuments(filter);
    const items = await PunishmentHistory.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();

    return res.json({ success: true, data: items, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

// Templates: list, create, delete
exports.getTemplates = async (req, res, next) => {
  try {
    const coupleId = req.user && req.user.coupleId;
    if (!coupleId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const templates = await PunishmentTemplate.find({ coupleId }).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: templates });
  } catch (err) { next(err); }
};

exports.addTemplate = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { name, text, difficulty, tags } = req.body;
    if (!text || !text.toString().trim()) return res.status(400).json({ success: false, message: 'Text required' });

    const tpl = await PunishmentTemplate.create({
      name: name || text.slice(0, 40),
      text: text.toString().trim(),
      difficulty: difficulty || 'low',
      tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map(s => s.trim()).filter(Boolean) : []),
      coupleId: user.coupleId,
      createdBy: user._id,
    });

    return res.status(201).json({ success: true, data: tpl });
  } catch (err) { next(err); }
};

exports.deleteTemplate = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'Invalid id' });
    const tpl = await PunishmentTemplate.findOne({ _id: id, coupleId: user.coupleId });
    if (!tpl) return res.status(404).json({ success: false, message: 'Not found' });
    // allow delete by creator or admins; for now allow if createdBy equals user
    if (tpl.createdBy && tpl.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    await tpl.remove();
    return res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

// Save a generated punishment text to history (custom save)
exports.saveHistory = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { text, entryId } = req.body;
    if (!text || !String(text).trim()) return res.status(400).json({ success: false, message: 'Text required' });

    const history = await PunishmentHistory.create({
      coupleId: user.coupleId,
      entryId: entryId || null,
      generatedText: String(text).trim(),
      generatedBy: user._id,
    });

    return res.status(201).json({ success: true, data: history });
  } catch (err) { next(err); }
};

// -------------------------
// New Punishments API
// -------------------------
exports.getPunishments = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || !user.coupleId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const coupleId = user.coupleId;
    const items = await Punishment.find({ coupleId, isActive: true }).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

exports.addPunishment = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || !user.coupleId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { text } = req.body;
    if (!text || !String(text).trim()) return res.status(400).json({ success: false, message: 'Punishment text is required' });
    const t = String(text).trim();
    // prevent duplicates (case-insensitive)
    const dup = await Punishment.findOne({ coupleId: user.coupleId, text: { $regex: `^${escapeRegex(t)}$`, $options: 'i' } });
    if (dup) return res.status(409).json({ success: false, message: 'Duplicate punishment' });

    const doc = await Punishment.create({ text: t, createdBy: user._id, coupleId: user.coupleId });
    return res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

exports.deletePunishment = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || !user.coupleId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid id' });
    const doc = await Punishment.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    if (String(doc.coupleId) !== String(user.coupleId)) return res.status(403).json({ success: false, message: 'Forbidden' });
    // soft-delete: mark inactive
    doc.isActive = false;
    await doc.save();
    return res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

exports.spinPunishment = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || !user.coupleId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    // Use aggregation to pick a random active punishment for the couple
    const sample = await Punishment.aggregate([
      { $match: { coupleId: mongoose.Types.ObjectId(user.coupleId), isActive: true } },
      { $sample: { size: 1 } },
    ]);
    if (!sample || sample.length === 0) return res.status(400).json({ success: false, message: 'No active punishments available' });
    return res.json({ success: true, data: sample[0] });
  } catch (err) { next(err); }
};

exports.saveGeneratedPunishment = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || !user.coupleId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { punishmentText } = req.body;
    if (!punishmentText || !String(punishmentText).trim()) return res.status(400).json({ success: false, message: 'punishmentText required' });
    const doc = await GeneratedPunishment.create({ punishmentText: String(punishmentText).trim(), selectedBy: user._id, coupleId: user.coupleId });
    return res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
};
