const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        emoji: {
            type: String,
            required: true,
            trim: true,
            maxlength: 12,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

const commentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: true }
);

const memorySchema = new mongoose.Schema(
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
        albumId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Album",
            default: null,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 4000,
            default: "",
        },
        photos: {
            type: [{
                public_id: { type: String, default: null },
                secure_url: { type: String, default: null },
            }],
            default: [],
        },
        location: {
            type: String,
            trim: true,
            maxlength: 120,
            default: "",
        },
        date: {
            type: Date,
            default: Date.now,
        },
        mood: {
            type: String,
            trim: true,
            maxlength: 40,
            default: "happy",
        },
        tags: {
            type: [String],
            default: [],
            validate: {
                validator: (tags) => Array.isArray(tags) && tags.every((tag) => typeof tag === "string"),
                message: "Tags must be an array of strings",
            },
        },
        favorite: {
            type: Boolean,
            default: false,
            index: true,
        },
        deleted: {
            type: Boolean,
            default: false,
            index: true,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
        partner: {
            type: String,
            trim: true,
            maxlength: 80,
            default: "",
        },
        visibility: {
            type: String,
            enum: ["private", "couple"],
            default: "couple",
        },
        likes: {
            type: Number,
            default: 0,
            min: 0,
        },
        reactions: [reactionSchema],
        comments: [commentSchema],
    },
    { timestamps: true }
);

memorySchema.index({ coupleId: 1, createdAt: -1 });
memorySchema.index({ coupleId: 1, favorite: -1, createdAt: -1 });
memorySchema.index({ coupleId: 1, deleted: 1, deletedAt: 1 });
memorySchema.index({ coupleId: 1, albumId: 1, deleted: 1, createdAt: -1 });
memorySchema.index({ albumId: 1, createdAt: -1 });
memorySchema.index({ favorite: 1, deleted: 1, createdAt: -1 });
memorySchema.index({ coupleId: 1, date: -1 });
memorySchema.index({ title: "text", description: "text", location: "text", tags: "text" });

module.exports = mongoose.models?.Memory || mongoose.model("Memory", memorySchema);
