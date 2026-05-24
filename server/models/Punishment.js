const mongoose = require('mongoose');
const { Schema } = mongoose;

const PunishmentSchema = new Schema({
  text: { type: String, required: true, trim: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  coupleId: { type: Schema.Types.ObjectId, ref: 'Couple', index: true },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

module.exports = mongoose.models?.Punishment || mongoose.model('Punishment', PunishmentSchema);
