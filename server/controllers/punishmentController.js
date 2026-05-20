const punishmentService = require('../services/punishmentService');
const PunishmentHistory = require('../models/PunishmentHistory');

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
    const items = await PunishmentHistory.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit).lean();

    return res.json({ success: true, data: items, meta: { total, page, limit, pages: Math.ceil(total/limit) } });
  } catch (err) { next(err); }
};
