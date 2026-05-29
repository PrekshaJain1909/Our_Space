const mongoose = require('mongoose');

const BucketTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: 'general' },
  targetDate: { type: Date, default: null },
  assignedTo: { type: String, default: null },
  notes: { type: String, default: '' },

  status: {
    type: String,
    enum: ['pending', 'approaching', 'completed', 'overdue'],
    default: 'pending',
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple' },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('BucketTask', BucketTaskSchema);
