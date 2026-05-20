const mongoose = require('mongoose');

const { Schema } = mongoose;

const healingSchema = new Schema(
  {
    coupleId: { type: Schema.Types.ObjectId, ref: 'Couple', index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    from: { type: String, required: true, trim: true },
    to: { type: String, required: true, trim: true },
    type: { type: String, enum: ['mistake','punishment','promise','forgiveness'], default: 'mistake', index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true, maxlength: 10000 },
    mood: { type: String, trim: true },
    category: { type: String, trim: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    status: { type: String, enum: ['pending','completed','forgiven','overdue','cancelled'], default: 'pending', index: true },
    dueDate: { type: Date, index: true },
    favorite: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

healingSchema.index({ userId: 1, createdAt: -1 });
healingSchema.index({ title: 'text', message: 'text' });

module.exports = mongoose.models && mongoose.models.Healing
  ? mongoose.models.Healing
  : mongoose.model('Healing', healingSchema);
