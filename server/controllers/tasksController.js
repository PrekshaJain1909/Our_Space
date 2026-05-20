const Task = require('../models/Task');
const mongoose = require('mongoose');

function sendError(res, status, message) {
  return res.status(status).json({ success: false, message });
}

const getValidObjectId = (id) => {
  if (!id) return null;
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return new mongoose.Types.ObjectId(id);
};

exports.createTask = async (req, res, next) => {
  try {
    console.log('[tasks:create] user:', req.user);
    console.log('[tasks:create] body:', req.body);

    const user = req.user;
    if (!user) return sendError(res, 401, 'Unauthorized');

    const coupleId = getValidObjectId(user.coupleId);
    if (!coupleId) return sendError(res, 400, 'Invalid coupleId');

    const { title, description, type, assignedTo, dueDate, priority, favorite } = req.body;
    if (!title || !title.toString().trim()) return sendError(res, 400, 'Title is required');

    const assignedToId = assignedTo && getValidObjectId(assignedTo);

    const task = await Task.create({
      title: title.toString().trim(),
      description: (description || '').toString(),
      type: type || 'mistake',
      coupleId,
      createdBy: getValidObjectId(user.userId || user._id || user.id),
      assignedTo: assignedToId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || 0,
      favorite: Boolean(favorite),
    });

    // emit socket event to couple room if socket is configured
    try {
      const io = req.app && req.app.get && req.app.get('io');
      if (io && coupleId) {
        io.to(`couple:${coupleId.toString()}`).emit('task:created', task);
      }
    } catch (e) {
      console.warn('Socket emit failed (task:created):', e.message);
    }

    return res.status(201).json({ success: true, message: 'Task created', data: task });
  } catch (err) {
    next(err);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    console.log('[tasks:get] user:', req.user);
    console.log('[tasks:get] query:', req.query);

    const user = req.user;
    if (!user) return sendError(res, 401, 'Unauthorized');

    const coupleId = getValidObjectId(user.coupleId);
    if (!coupleId) return sendError(res, 400, 'Invalid coupleId');

    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const { status, person, type, search, sort } = req.query;

    const filter = { coupleId };
    if (status) filter.status = { $in: status.split(',') };
    if (type) filter.type = type;
    if (person) filter.$or = [{ createdBy: person }, { assignedTo: person }];
    if (search) filter.$text = { $search: search };

    let sortObj = { createdAt: -1 };
    if (sort === 'due') sortObj = { dueDate: 1, createdAt: -1 };
    if (sort === 'priority') sortObj = { priority: -1, createdAt: -1 };

    const total = await Task.countDocuments(filter);
    const tasks = await Task.find(filter).sort(sortObj).skip(skip).limit(limit).lean();

    return res.json({ success: true, message: 'Tasks retrieved', data: tasks, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

exports.getTaskById = async (req, res, next) => {
  try {
    console.log('[tasks:getById] params:', req.params, 'user:', req.user);
    const { id } = req.params;
    if (!getValidObjectId(id)) return sendError(res, 400, 'Invalid id');

    const task = await Task.findById(id).lean();
    if (!task) return sendError(res, 404, 'Task not found');

    // ensure same couple
    const user = req.user;
    if (!user) return sendError(res, 401, 'Unauthorized');
    if (task.coupleId.toString() !== (user.coupleId || '').toString()) return sendError(res, 403, 'Forbidden');

    return res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

exports.updateTask = async (req, res, next) => {
  try {
    console.log('[tasks:update] params:', req.params, 'body:', req.body);
    const { id } = req.params;
    if (!getValidObjectId(id)) return sendError(res, 400, 'Invalid id');

    const task = await Task.findById(id);
    if (!task) return sendError(res, 404, 'Task not found');

    // authorize
    const user = req.user; if (!user) return sendError(res, 401, 'Unauthorized');
    if (task.coupleId.toString() !== (user.coupleId || '').toString()) return sendError(res, 403, 'Forbidden');

    const { title, description, assignedTo, dueDate, status, favorite, priority } = req.body;
    if (title !== undefined) task.title = title || task.title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    if (status !== undefined) task.status = status;
    if (favorite !== undefined) task.favorite = Boolean(favorite);
    if (priority !== undefined) task.priority = Number(priority) || 0;

    // set completedAt when marking done
    if (status === 'done' && !task.completedAt) task.completedAt = new Date();
    if (status !== 'done') task.completedAt = task.completedAt || null;

    await task.save();
    try {
      const io = req.app && req.app.get && req.app.get('io');
      if (io && task.coupleId) io.to(`couple:${task.coupleId.toString()}`).emit('task:updated', task);
    } catch (e) { console.warn('Socket emit failed (task:updated):', e.message); }
    return res.json({ success: true, message: 'Task updated', data: task });
  } catch (err) { next(err); }
};

exports.completeTask = async (req, res, next) => {
  try {
    console.log('[tasks:complete] params:', req.params);
    const { id } = req.params;
    if (!getValidObjectId(id)) return sendError(res, 400, 'Invalid id');

    const task = await Task.findById(id);
    if (!task) return sendError(res, 404, 'Task not found');

    const user = req.user; if (!user) return sendError(res, 401, 'Unauthorized');
    if (task.coupleId.toString() !== (user.coupleId || '').toString()) return sendError(res, 403, 'Forbidden');

    task.status = 'done';
    task.completedAt = new Date();
    task.metadata = task.metadata || {};
    task.metadata.completedBy = user.userId || user._id || user.id;
    task.metadata.completionMessage = req.body.completionMessage || task.metadata.completionMessage || '';

    await task.save();
    try { const io = req.app && req.app.get && req.app.get('io'); if (io && task.coupleId) io.to(`couple:${task.coupleId.toString()}`).emit('task:updated', task); } catch(e){}
    return res.json({ success: true, message: 'Task completed', data: task });
  } catch (err) { next(err); }
};

exports.undoComplete = async (req, res, next) => {
  try {
    console.log('[tasks:undo] params:', req.params);
    const { id } = req.params;
    if (!getValidObjectId(id)) return sendError(res, 400, 'Invalid id');

    const task = await Task.findById(id);
    if (!task) return sendError(res, 404, 'Task not found');
    const user = req.user; if (!user) return sendError(res, 401, 'Unauthorized');
    if (task.coupleId.toString() !== (user.coupleId || '').toString()) return sendError(res, 403, 'Forbidden');

    task.status = 'pending';
    task.completedAt = null;
    if (task.metadata) delete task.metadata.completedBy;
    await task.save();
    try { const io = req.app && req.app.get && req.app.get('io'); if (io && task.coupleId) io.to(`couple:${task.coupleId.toString()}`).emit('task:updated', task); } catch(e){}
    return res.json({ success: true, message: 'Completion undone', data: task });
  } catch (err) { next(err); }
};

exports.forgiveTask = async (req, res, next) => {
  try {
    console.log('[tasks:forgive] params:', req.params, 'body:', req.body);
    const { id } = req.params;
    if (!getValidObjectId(id)) return sendError(res, 400, 'Invalid id');

    const task = await Task.findById(id);
    if (!task) return sendError(res, 404, 'Task not found');
    const user = req.user; if (!user) return sendError(res, 401, 'Unauthorized');
    if (task.coupleId.toString() !== (user.coupleId || '').toString()) return sendError(res, 403, 'Forbidden');

    task.status = 'forgiven';
    task.completedAt = new Date();
    task.metadata = task.metadata || {};
    task.metadata.forgivenBy = user.userId || user._id || user.id;
    task.metadata.forgivenessNote = req.body.note || '';
    await task.save();
    try { const io = req.app && req.app.get && req.app.get('io'); if (io && task.coupleId) io.to(`couple:${task.coupleId.toString()}`).emit('task:updated', task); } catch(e){}
    return res.json({ success: true, message: 'Task forgiven', data: task });
  } catch (err) { next(err); }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!getValidObjectId(id)) return sendError(res, 400, 'Invalid id');
    const task = await Task.findById(id);
    if (!task) return sendError(res, 404, 'Task not found');
    const user = req.user; if (!user) return sendError(res, 401, 'Unauthorized');
    if (task.coupleId.toString() !== (user.coupleId || '').toString()) return sendError(res, 403, 'Forbidden');
    await task.remove();
    try { const io = req.app && req.app.get && req.app.get('io'); if (io && task.coupleId) io.to(`couple:${task.coupleId.toString()}`).emit('task:deleted', { _id: id }); } catch(e){}
    return res.json({ success: true, message: 'Task deleted' });
  } catch (err) { next(err); }
};
