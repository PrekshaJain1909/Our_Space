const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({

  email: {
    type: String,
    required: true
  },

  otp: {
    type: String,
    required: true
  },

  expiresAt: {
    type: Date,
    required: true
  },

  purpose: {
    type: String,
    enum: ["registration", "login"],
    default: "registration"
  }

}, { timestamps: true });

module.exports = mongoose.model("OTP", otpSchema);
