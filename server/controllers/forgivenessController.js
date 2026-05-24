const Forgiveness = require('../models/Forgiveness');
const Healing = require('../models/Healing');
const mongoose = require('mongoose');

function sendError(res, status, message) {
  return res.status(status).json({ success: false, message });
}

const getValidObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return new mongoose.Types.ObjectId(id);
};

exports.createForgiveness = async (req, res, next) => {
  try {
    console.log('[forgiveness:create] user:', req.user && req.user._id, 'body:', req.body, 'params:', req.params);
    const user = req.user;
    if (!user || !user._id) return sendError(res, 401, 'Unauthorized');

    const { originalEntryId, forgivenessMessage, receiverId, linkedEntryId } = req.body;

    const forgivenessBy = user._id;

    let orig = null;
    let linkedId = null;
    let forgivenessType = 'standalone';

    // If originalEntryId / linkedEntryId provided, treat as linked forgiveness
    const providedId = originalEntryId || linkedEntryId;
    if (providedId && mongoose.Types.ObjectId.isValid(providedId)) {
      orig = await Healing.findById(providedId);
      if (!orig) return sendError(res, 404, 'Original entry not found');
      if (!orig.coupleId || !user.coupleId || orig.coupleId.toString() !== user.coupleId.toString()) return sendError(res, 403, 'Forbidden');

      // Prevent creating duplicate forgiveness for the same original entry
      const alreadyForgiven = await Forgiveness.findOne({ $or: [{ originalEntryId: orig._id }, { linkedEntryId: orig._id }] });
      if (alreadyForgiven) return sendError(res, 409, 'This entry has already been forgiven');

      // Determine partner id (forgivenTo)
      let forgivenTo = null;
      if (orig.createdBy && orig.createdBy.toString() !== user._id.toString()) {
        forgivenTo = orig.createdBy;
      } else if (orig.assignedTo && orig.assignedTo.toString() !== user._id.toString()) {
        forgivenTo = orig.assignedTo;
      } else {
        forgivenTo = orig.userId && orig.userId.toString() !== user._id.toString() ? orig.userId : null;
      }
      if (!forgivenTo) return sendError(res, 400, 'Could not determine who to forgive');

      forgivenessType = 'linked';
      linkedId = orig._id;

      // Create forgiveness doc for linked entry
      const forgiveness = await Forgiveness.create({
        coupleId: user.coupleId,
        originalEntryId: orig._id,
        linkedEntryId: linkedId,
        title: req.body.title || 'Forgiveness',
        forgivenBy: forgivenessBy,
        senderId: forgivenessBy,
        forgivenTo,
        receiverId: forgivenTo,
        forgivenessMessage: (forgivenessMessage || '').toString().slice(0, 5000),
        forgivenessType,
        status: 'forgiven',
        forgivenAt: new Date(),
      });
      console.log('[forgiveness:create] created forgiveness id:', forgiveness._id);

      // Update original entry (only if not already marked)
      if (orig.status !== 'forgiven') {
        orig.status = 'forgiven';
        orig.metadata = orig.metadata || {};
        orig.metadata.forgivenessMessage = forgiveness.forgivenessMessage;
        orig.metadata.forgivenAt = forgiveness.forgivenAt;
        await orig.save();
      }

      // Real-time channel disabled: no socket emits for forgiveness

      // Return created forgiveness plus refreshed list for the couple
      const list = await Forgiveness.find({ coupleId: user.coupleId }).sort({ forgivenAt: -1 }).limit(200).populate('forgivenBy', 'name').populate('forgivenTo', 'name').populate('originalEntryId').populate('linkedEntryId');
      return res.status(201).json({ success: true, message: 'Forgiveness created', data: forgiveness, list });
    }

    // Standalone forgiveness flow
    // Determine receiver: use provided receiverId or infer from couple members
    let forgivenToId = null;
    if (receiverId && mongoose.Types.ObjectId.isValid(receiverId)) {
      forgivenToId = receiverId;
    } else {
      // try to infer from Couple
      const Couple = require('../models/Couple');
      const coupleDoc = await Couple.findById(user.coupleId).exec();
      if (coupleDoc) {
        const a = coupleDoc.partnerA && coupleDoc.partnerA.toString();
        const b = coupleDoc.partnerB && coupleDoc.partnerB.toString();
        const me = user._id.toString();
        if (a && a !== me) forgivenToId = a;
        else if (b && b !== me) forgivenToId = b;
      }
    }
    if (!forgivenToId) return sendError(res, 400, 'Could not determine who to forgive');

    const standalone = await Forgiveness.create({
      coupleId: user.coupleId,
      title: req.body.title || 'Forgiveness',
      forgivenBy: forgivenessBy,
      senderId: forgivenessBy,
      forgivenTo: forgivenToId,
      receiverId: forgivenToId,
      forgivenessMessage: (forgivenessMessage || '').toString().slice(0, 5000),
      forgivenessType: 'standalone',
      status: 'forgiven',
      forgivenAt: new Date(),
    });
    console.log('[forgiveness:create] created standalone forgiveness id:', standalone._id);

    // Real-time channel disabled: no socket emits for standalone forgiveness

    const list = await Forgiveness.find({ coupleId: user.coupleId }).sort({ forgivenAt: -1 }).limit(200).populate('forgivenBy', 'name').populate('forgivenTo', 'name').populate('originalEntryId').populate('linkedEntryId');
    return res.status(201).json({ success: true, message: 'Forgiveness created', data: standalone, list } );
  } catch (err) {
    console.error('[forgiveness:create] error:', err && err.message);
    next(err);
  }
};

exports.getByOriginalId = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || !user.coupleId) return sendError(res, 401, 'Unauthorized');
    const { originalId } = req.params;
    if (!originalId || !mongoose.Types.ObjectId.isValid(originalId)) return sendError(res, 400, 'Invalid originalId');
    const doc = await Forgiveness.findOne({ originalEntryId: originalId, coupleId: user.coupleId })
      .populate('forgivenBy', 'name')
      .populate('forgivenTo', 'name')
      .populate('originalEntryId')
      .exec();
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

exports.getForgiveness = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || !user.coupleId) return sendError(res, 401, 'Unauthorized');

    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '20', 10)));

    const filter = { coupleId: user.coupleId };
    const total = await Forgiveness.countDocuments(filter);
    const items = await Forgiveness.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('forgivenBy', 'name')
      .populate('forgivenTo', 'name')
      .populate('originalEntryId')
      .populate('linkedEntryId')
      .exec();

    return res.json({ success: true, message: 'Forgiveness entries retrieved', data: items, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

exports.getPendingEntries = async (req, res, next) => {
  // Pending entries endpoint removed — use Healing entries via /healing/entries instead
  return res.status(410).json({ success: false, message: 'Pending entries endpoint removed' });
};

exports.getStats = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || !user.coupleId) return sendError(res, 401, 'Unauthorized');

    const totalForgiven = await Forgiveness.countDocuments({ coupleId: user.coupleId });
    const recent = await Forgiveness.find({ coupleId: user.coupleId }).sort({ forgivenAt: -1 }).limit(5).populate('forgivenBy', 'name').populate('forgivenTo', 'name');

    return res.json({ success: true, message: 'Forgiveness stats', data: { totalForgiven, recent } });
  } catch (err) { next(err); }
};

exports.markForgivenessDone = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || !user.coupleId) return sendError(res, 401, 'Unauthorized');

    const id = req.params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return sendError(res, 400, 'Invalid id');

    const forgiveness = await Forgiveness.findById(id);
    if (!forgiveness) return sendError(res, 404, 'Forgiveness entry not found');
    if (forgiveness.coupleId.toString() !== user.coupleId.toString()) return sendError(res, 403, 'Forbidden');

    if (forgiveness.status === 'forgiven' && forgiveness.forgivenAt) {
      return res.json({ success: true, message: 'Already marked forgiven', data: forgiveness });
    }

    forgiveness.status = 'forgiven';
    forgiveness.forgivenAt = new Date();
    await forgiveness.save();

    // Update original healing entry
    try {
      const orig = await Healing.findById(forgiveness.originalEntryId);
      if (orig && orig.status !== 'forgiven') {
        orig.status = 'forgiven';
        orig.metadata = orig.metadata || {};
        orig.metadata.forgivenessMessage = forgiveness.forgivenessMessage || orig.metadata.forgivenessMessage;
        orig.metadata.forgivenAt = forgiveness.forgivenAt;
        await orig.save();
      }
      // Real-time channel disabled: no socket emits on mark done
    } catch (emitErr) {
      console.warn('[forgiveness] mark done socket/backup failed:', emitErr && emitErr.message);
    }

    // Return updated forgiveness list for couple (first page)
    const list = await Forgiveness.find({ coupleId: user.coupleId }).sort({ forgivenAt: -1 }).limit(200).populate('forgivenBy', 'name').populate('forgivenTo', 'name');

    return res.json({ success: true, message: 'Marked forgiven', data: forgiveness, list });
  } catch (err) { next(err); }
};
