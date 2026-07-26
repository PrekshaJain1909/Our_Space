const mongoose = require('mongoose');

const WeddingVisionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    image: { type: String, required: true },
    referenceLink: { type: String, default: null },
    favorite: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('WeddingVision', WeddingVisionSchema);
