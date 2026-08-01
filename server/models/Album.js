const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema(
    {
        coupleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Couple",
            required: true,
            index: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 80,
        },
        coverImage: {
            type: String,
            default: "",
        },
        photoCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        description: {
            type: String,
            default: "",
            trim: true,
            maxlength: 300,
        },
        deleted: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    { timestamps: true }
);

albumSchema.index({ coupleId: 1, createdAt: -1 });
albumSchema.index({ coupleId: 1, deleted: 1, updatedAt: -1 });

module.exports = mongoose.models?.Album || mongoose.model("Album", albumSchema);
