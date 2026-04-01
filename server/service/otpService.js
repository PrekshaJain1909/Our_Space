// service/otpService.js
const OTP = require("../models/OTP");

const OTP_EXPIRY_MINUTES = 5;
const MAX_VERIFY_ATTEMPTS = 5;   // failed attempts before OTP is invalidated
const MAX_RESEND_COUNT    = 5;   // how many times a new OTP can be requested per session
const RESEND_COOLDOWN_SEC = 60;  // seconds to wait between resend requests

exports.generateOTP = () => {
  const i = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("Generating OTP...", i);
  return i;
};

/**
 * Save a new OTP for the given email.
 * @param {string}  email
 * @param {string}  otp
 * @param {boolean} isResend – true when this is a resend (not the very first send)
 * @returns {{ success: boolean, message?: string, waitSeconds?: number }}
 */
exports.saveOTP = async (email, otp, isResend = false) => {
  const existing = await OTP.findOne({ email });

  let resendCount  = 0;
  let lastResentAt = null;

  if (isResend) {
    const baseResendCount = existing ? (existing.resendCount || 0) : 0;

    // Enforce max resend limit
    if (baseResendCount >= MAX_RESEND_COUNT) {
      return {
        success: false,
        message: "Maximum OTP resend limit reached. Please try again later.",
      };
    }

    // Enforce cooldown between resends
    const cooldownBase = existing?.lastResentAt || existing?.createdAt;
    if (cooldownBase) {
      const secondsSinceLast = (Date.now() - new Date(cooldownBase).getTime()) / 1000;
      if (secondsSinceLast < RESEND_COOLDOWN_SEC) {
        const waitSeconds = Math.ceil(RESEND_COOLDOWN_SEC - secondsSinceLast);
        return {
          success: false,
          message: `Please wait ${waitSeconds} second${waitSeconds !== 1 ? "s" : ""} before requesting a new OTP.`,
          waitSeconds,
        };
      }
    }

    resendCount  = baseResendCount + 1;
    lastResentAt = new Date();
  }

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await OTP.deleteMany({ email });

  await OTP.create({ email, otp, expiresAt, resendCount, lastResentAt });

  return { success: true };
};

/**
 * Verify an OTP for the given email.
 * Tracks failed attempts and invalidates the OTP after MAX_VERIFY_ATTEMPTS.
 * @returns {{ success: boolean, message?: string, attemptsLeft?: number, locked?: boolean }}
 */
exports.verifyOTP = async (email, otp) => {
  const record = await OTP.findOne({ email });

  if (!record) {
    return { success: false, message: "No active OTP found. Please request a new one." };
  }

  if (record.expiresAt < Date.now()) {
    await OTP.deleteMany({ email });
    return { success: false, message: "OTP has expired. Please request a new one." };
  }

  // Wrong OTP
  if (record.otp !== otp) {
    record.attempts += 1;

    if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
      await OTP.deleteMany({ email });
      return {
        success: false,
        message: "Too many failed attempts. Please request a new OTP.",
        locked: true,
      };
    }

    await record.save();
    const attemptsLeft = MAX_VERIFY_ATTEMPTS - record.attempts;
    return {
      success: false,
      message: `Invalid OTP. ${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} remaining.`,
      attemptsLeft,
    };
  }

  // Correct — clean up
  await OTP.deleteMany({ email });
  return { success: true };
};
