const mongoose = require('mongoose');
const { Schema } = mongoose;

const GeneratedPunishmentSchema = new Schema({
  punishmentText: { type: String, required: true },
  selectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  coupleId: { type: Schema.Types.ObjectId, ref: 'Couple', index: true },
  generatedAt: { type: Date, default: Date.now, index: true },
}, { timestamps: false });

module.exports = mongoose.models?.GeneratedPunishment || mongoose.model('GeneratedPunishment', GeneratedPunishmentSchema);
