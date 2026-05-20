const mongoose = require('mongoose');
const { Schema } = mongoose;

const PunishmentHistorySchema = new Schema({
  coupleId: { type: Schema.Types.ObjectId, ref: 'Couple', required: true, index: true },
  entryId: { type: Schema.Types.ObjectId, ref: 'Healing' },
  generatedText: { type: String, required: true },
  generatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.models?.PunishmentHistory || mongoose.model('PunishmentHistory', PunishmentHistorySchema);
