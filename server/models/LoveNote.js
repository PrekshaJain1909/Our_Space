const mongoose = require('mongoose');

const { Schema } = mongoose;

const loveNoteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    from: { type: String, required: true, trim: true },
    to: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    mood: { type: String, trim: true },
    favorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes
loveNoteSchema.index({ userId: 1, createdAt: -1 });
loveNoteSchema.index({ title: 'text' });

module.exports = mongoose.models && mongoose.models.LoveNote
  ? mongoose.models.LoveNote
  : mongoose.model('LoveNote', loveNoteSchema);
