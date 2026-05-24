const mongoose = require('mongoose');

const EntrySchema = new mongoose.Schema({
  id: { type: String, required: true },
  date: { type: String, required: true },
  count: { type: Number, default: 0 },
  status: { type: String },
  note: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedByName: { type: String }
}, { _id: false });

const HabitSchema = new mongoose.Schema({
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true },
  name: { type: String, required: true },
  category: { type: String, default: 'general' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ownerName: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  collapsed: { type: Boolean, default: false },
  history: { type: [EntrySchema], default: [] }
});

module.exports = mongoose.model('Habit', HabitSchema);
