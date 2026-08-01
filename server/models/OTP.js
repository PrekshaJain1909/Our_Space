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
  },

  // Number of failed verification attempts against this OTP
  attempts: {
    type: Number,
    default: 0
  },

  // How many times a new OTP has been resent to this email
  resendCount: {
    type: Number,
    default: 0
  },

  // Timestamp of the most recent resend (for cooldown enforcement)
  lastResentAt: {
    type: Date,
    default: null
  }

}, { timestamps: true });

module.exports = mongoose.model("OTP", otpSchema);
