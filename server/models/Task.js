const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['promise','punishment','mistake','healing','forgiveness'], default: 'mistake' },
  status: { type: String, enum: ['pending','in_progress','done','forgiven'], default: 'pending', index: true },
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, default: null },
  dueDate: { type: Date, default: null, index: true },
  completedAt: { type: Date, default: null },
  favorite: { type: Boolean, default: false },
  priority: { type: Number, default: 0 },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

// text index for search
TaskSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Task', TaskSchema);
