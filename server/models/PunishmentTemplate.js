const mongoose = require('mongoose');
const { Schema } = mongoose;

const PunishmentTemplateSchema = new Schema({
  name: { type: String, required: true, trim: true },
  text: { type: String, required: true },
  difficulty: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  tags: [{ type: String }],
  coupleId: { type: Schema.Types.ObjectId, ref: 'Couple', required: true, index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.models?.PunishmentTemplate || mongoose.model('PunishmentTemplate', PunishmentTemplateSchema);
