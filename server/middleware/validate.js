const mongoose = require('mongoose');

exports.ensureObjectId = (paramName = 'id') => (req, res, next) => {
  const id = req.params[paramName] || req.body[paramName] || req.query[paramName];
  if (!id) return res.status(400).json({ success: false, message: 'Missing id' });
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid id format' });
  next();
};

exports.limitOffset = (maxLimit = 100) => (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.max(1, Math.min(maxLimit, parseInt(req.query.limit || '20', 10)));
  req.paging = { page, limit, skip: (page - 1) * limit };
  next();
};
