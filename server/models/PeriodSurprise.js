const mongoose = require("mongoose");

const periodSurpriseSchema = new mongoose.Schema(
  {
    coupleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Couple",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["letter", "flowers", "gift", "date", "playlist", "other"],
      default: "gift",
    },
    content: {
      type: String,
      default: "",
    },
    targetCycleStartDate: {
      type: Date,
      default: null,
    },
    isRevealed: {
      type: Boolean,
      default: false,
    },
    revealedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PeriodSurprise", periodSurpriseSchema);
