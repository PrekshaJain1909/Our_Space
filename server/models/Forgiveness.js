const mongoose = require('mongoose');

const ForgivenessSchema = new mongoose.Schema({
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true, index: true },
  // legacy/original healing entry id (optional)
  originalEntryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Healing', required: false, index: true },
  // canonical linked id for new API (optional)
  linkedEntryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Healing', required: false, index: true },
  // who sent the forgiveness (alias fields kept for backwards compatibility)
  forgivenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Forgiveness' },
  // also store as senderId for compatibility with new API expectations
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  forgivenTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  forgivenessMessage: { type: String, default: '' },
  forgivenessType: { type: String, enum: ['linked', 'standalone'], default: 'linked' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'forgiven'], default: 'pending' },
  forgivenAt: { type: Date, default: null },
}, { timestamps: true });

// Ensure an original Healing entry can only have one forgiveness record
// Ensure an original Healing entry can only have one forgiveness record (sparse so standalone forgiveness allowed)
ForgivenessSchema.index({ originalEntryId: 1 }, { unique: true, sparse: true });
ForgivenessSchema.index({ linkedEntryId: 1 }, { unique: true, sparse: true });
ForgivenessSchema.index({ forgivenAt: -1 });

module.exports = mongoose.model('Forgiveness', ForgivenessSchema);
