const mongoose = require('mongoose');
const HealingEntry = require('../models/Healing');

const toObjectId = (id) => {
  if (!id) return null;
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return new mongoose.Types.ObjectId(id);
};

exports.overview = async (req, res, next) => {
  try {
    const coupleId = req.user.coupleId;
    const coupleObjectId = toObjectId(coupleId);
    if (!coupleObjectId) return res.status(400).json({ success: false, message: 'Invalid coupleId' });
    const match = { coupleId: coupleObjectId };

    const agg = await HealingEntry.aggregate([
      { $match: match },
      { $facet: {
        total: [{ $count: 'count' }],
        pending: [{ $match: { status: 'pending' } }, { $count: 'count' }],
        completedPromises: [{ $match: { type: 'promise', status: 'completed' } }, { $count: 'count' }],
        forgiveness: [{ $match: { type: 'forgiveness' } }, { $count: 'count' }],
        byUser: [ { $group: { _id: '$createdBy', count: { $sum: 1 } } }, { $sort: { count: -1 } } ]
      }},
    ]);

    const result = agg[0] || {};
    return res.json({ success: true, data: {
      total: result.total?.[0]?.count || 0,
      pending: result.pending?.[0]?.count || 0,
      completedPromises: result.completedPromises?.[0]?.count || 0,
      forgivenessCount: result.forgiveness?.[0]?.count || 0,
      byUser: result.byUser || []
    }});
  } catch (err) { next(err); }
};

exports.trends = async (req, res, next) => {
  try {
    const coupleId = req.user.coupleId;
    const coupleObjectId = toObjectId(coupleId);
    if (!coupleObjectId) return res.status(400).json({ success: false, message: 'Invalid coupleId' });
    const weeks = parseInt(req.query.weeks || '12', 10);
    const since = new Date();
    since.setDate(since.getDate() - (weeks * 7));

    const agg = await HealingEntry.aggregate([
      { $match: { coupleId: coupleObjectId, createdAt: { $gte: since } } },
      { $addFields: { week: { $isoWeek: '$createdAt' }, year: { $isoWeekYear: '$createdAt' } } },
      { $group: { _id: { year: '$year', week: '$week', type: '$type' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.week': 1 } }
    ]);

    return res.json({ success: true, data: agg });
  } catch (err) { next(err); }
};

exports.people = async (req, res, next) => {
  try {
    const coupleId = req.user.coupleId;
    const coupleObjectId2 = toObjectId(coupleId);
    if (!coupleObjectId2) return res.status(400).json({ success: false, message: 'Invalid coupleId' });
    const agg = await HealingEntry.aggregate([
      { $match: { coupleId: coupleObjectId2 } },
      { $facet: {
        apologizers: [{ $match: { type: 'mistake' } }, { $group: { _id: '$createdBy', count: { $sum: 1 } } }, { $sort: { count: -1 } }],
        forgivers: [{ $match: { type: 'forgiveness' } }, { $group: { _id: '$createdBy', count: { $sum: 1 } } }, { $sort: { count: -1 } }],
        punishmentsCompleted: [{ $match: { type: 'punishment', status: 'completed' } }, { $group: { _id: '$assignedTo', count: { $sum: 1 } } }, { $sort: { count: -1 } }]
      }}
    ]);

    return res.json({ success: true, data: agg[0] || {} });
  } catch (err) { next(err); }
};
