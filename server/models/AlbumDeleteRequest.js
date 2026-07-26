const mongoose = require("mongoose");

const albumDeleteRequestSchema = new mongoose.Schema(
    {
        albumId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Album",
            required: true,
            index: true,
        },
        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        requestedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        coupleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Couple",
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED"],
            default: "PENDING",
            index: true,
        },
    },
    { timestamps: true }
);

albumDeleteRequestSchema.index({ albumId: 1, status: 1 });

module.exports = mongoose.models?.AlbumDeleteRequest || mongoose.model("AlbumDeleteRequest", albumDeleteRequestSchema);
