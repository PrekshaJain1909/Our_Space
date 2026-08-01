const mongoose = require("mongoose");

const periodLogSchema = new mongoose.Schema(
  {
    coupleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Couple",
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD format
      required: true,
    },
    moods: [
      {
        type: String,
      },
    ],
    symptoms: [
      {
        type: String,
      },
    ],
    notes: {
      type: String,
      default: "",
    },
    loggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

periodLogSchema.index({ coupleId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("PeriodLog", periodLogSchema);
