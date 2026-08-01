const mongoose = require("mongoose");

const periodSettingsSchema = new mongoose.Schema(
  {
    coupleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Couple",
      required: true,
      unique: true,
    },
    lastPeriodStart: {
      type: Date,
      required: true,
    },
    cycleLength: {
      type: Number,
      default: 28,
      min: 21,
      max: 35,
    },
    periodLength: {
      type: Number,
      default: 5,
      min: 2,
      max: 10,
    },
    customColors: {
      period: { type: String, default: "#FCA5A5" }, // Pastel Red/Pink
      freshStart: { type: String, default: "#86EFAC" }, // Pastel Green
      bestDays: { type: String, default: "#FDE047" }, // Pastel Yellow
      calmDays: { type: String, default: "#A7F3D0" }, // Pastel Teal/Cyan
      takeCare: { type: String, default: "#FDBA74" }, // Pastel Orange
    },
    phases: [
  {
    key: { type: String, required: true },

    name: { type: String, required: true },

    emoji: {
      type: String,
      default: "✨",
    },

    color: {
      type: String,
      default: "#FCA5A5",
    },

    desc: {
      type: String,
      default: "",
    },

    startDay: {
      type: Number,
      required: true,
    },

    endDay: {
      type: Number,
      required: true,
    },

    order: {
      type: Number,
      default: 0,
    },

    enabled: {
      type: Boolean,
      default: true,
    },

    isCustom: {
      type: Boolean,
      default: false,
    },
  },
],
    remindersEnabled: {
      type: Boolean,
      default: true,
    },
    femalePartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    malePartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PeriodSettings", periodSettingsSchema);
