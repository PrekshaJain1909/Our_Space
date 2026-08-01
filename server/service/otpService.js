// service/otpService.js
const OTP = require("../models/OTP");
const crypto = require("crypto");

const OTP_EXPIRY_MINUTES = 5;
const MAX_VERIFY_ATTEMPTS = 5;   // failed attempts before OTP is invalidated
const MAX_RESEND_COUNT = 5;   // how many times a new OTP can be requested per session
const RESEND_COOLDOWN_SEC = 60;  // seconds to wait between resend requests

const OTP_DEBUG_PREFIX = "[OTP]";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const normalizeOtp = (otp) => String(otp ?? "").trim();

const OTP_HASH_SECRET = process.env.OTP_HASH_SECRET || process.env.JWT_SECRET || "otp-default-secret";

const hashOtp = (email, otp) => {
  return crypto
    .createHmac("sha256", OTP_HASH_SECRET)
    .update(`${normalizeEmail(email)}:${normalizeOtp(otp)}`)
    .digest("hex");
};

const timingSafeEqualString = (a, b) => {
  const aBuf = Buffer.from(String(a || ""));
  const bBuf = Buffer.from(String(b || ""));

  if (aBuf.length !== bBuf.length) return false;

  return crypto.timingSafeEqual(aBuf, bBuf);
};

const maskEmail = (email) => {
  const normalized = normalizeEmail(email);
  const [local, domain] = normalized.split("@");

  if (!local || !domain) return normalized;
  if (local.length <= 2) return `${local[0] || "*"}*@${domain}`;

  return `${local.slice(0, 2)}***@${domain}`;
};

const safeOtpMeta = (otp) => {
  const value = normalizeOtp(otp);
  if (!value) return { length: 0 };
  return { length: value.length, last2: value.slice(-2) };
};

exports.generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const shouldDebugOtp =
    process.env.NODE_ENV !== "production" ||
    process.env.OTP_DEBUG === "true";

  if (shouldDebugOtp) {
    console.log(`${OTP_DEBUG_PREFIX} generateOTP`, {
      otp,
      createdAt: new Date().toISOString(),
    });
  } else {
    console.log(`${OTP_DEBUG_PREFIX} generateOTP`, {
      otpLength: otp.length,
      createdAt: new Date().toISOString(),
    });
  }

  return otp;
};

/**
 * Save a new OTP for the given email.
 * @param {string}  email
 * @param {string}  otp
 * @param {boolean} isResend – true when this is a resend (not the very first send)
 * @returns {{ success: boolean, message?: string, waitSeconds?: number }}
 */
exports.saveOTP = async (email, otp, isResend = false) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedOtp = normalizeOtp(otp);

  if (!normalizedEmail) {
    return { success: false, message: "Email is required to send OTP." };
  }

  if (!normalizedOtp || normalizedOtp.length !== 6) {
    return { success: false, message: "Generated OTP is invalid." };
  }

  const records = await OTP.find({ email: normalizedEmail }).sort({ createdAt: -1 });
  const existing = records[0] || null;

  if (records.length > 1) {
    const staleIds = records.slice(1).map((r) => r._id);
    await OTP.deleteMany({ _id: { $in: staleIds } });

    console.warn(`${OTP_DEBUG_PREFIX} saveOTP duplicate records cleaned`, {
      email: maskEmail(normalizedEmail),
      duplicateCount: records.length,
      removedCount: staleIds.length,
    });
  }

  let resendCount = 0;
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

    resendCount = baseResendCount + 1;
    lastResentAt = new Date();
  }

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  const otpHash = hashOtp(normalizedEmail, normalizedOtp);

  const updated = await OTP.findOneAndUpdate(
    { email: normalizedEmail },
    {
      $set: {
        email: normalizedEmail,
        otp: otpHash,
        expiresAt,
        attempts: 0,
        purpose: "registration",
        resendCount,
        lastResentAt,
      },
    },
    { new: true, upsert: true }
  );

  // Keep one latest OTP document per email to reduce resend races.
  await OTP.deleteMany({ email: normalizedEmail, _id: { $ne: updated._id } });

  console.log(`${OTP_DEBUG_PREFIX} saveOTP stored`, {
    email: maskEmail(normalizedEmail),
    isResend,
    resendCount,
    expiresAt: expiresAt.toISOString(),
    otpMeta: safeOtpMeta(normalizedOtp),
    recordId: String(updated._id),
  });

  return { success: true };
};

/**
 * Verify an OTP for the given email.
 * Tracks failed attempts and invalidates the OTP after MAX_VERIFY_ATTEMPTS.
 * @returns {{ success: boolean, message?: string, attemptsLeft?: number, locked?: boolean }}
 */
exports.verifyOTP = async (email, otp) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedOtp = normalizeOtp(otp);

  if (!normalizedEmail) {
    return { success: false, message: "Email is required for OTP verification." };
  }

  if (!normalizedOtp) {
    return { success: false, message: "OTP is required." };
  }

  console.log(`${OTP_DEBUG_PREFIX} verifyOTP received`, {
    email: maskEmail(normalizedEmail),
    otpMeta: safeOtpMeta(normalizedOtp),
    otpType: typeof otp,
  });

  const records = await OTP.find({ email: normalizedEmail }).sort({ createdAt: -1 });

  if (records.length > 1) {
    const staleIds = records.slice(1).map((r) => r._id);
    await OTP.deleteMany({ _id: { $in: staleIds } });
    console.warn(`${OTP_DEBUG_PREFIX} verifyOTP duplicate records cleaned`, {
      email: maskEmail(normalizedEmail),
      duplicateCount: records.length,
      removedCount: staleIds.length,
    });
  }

  const record = records[0];

  if (!record) {
    return { success: false, message: "No active OTP found. Please request a new one." };
  }

  if (record.expiresAt.getTime() < Date.now()) {
    await OTP.deleteMany({ email: normalizedEmail });

    console.warn(`${OTP_DEBUG_PREFIX} verifyOTP expired`, {
      email: maskEmail(normalizedEmail),
      expiresAt: record.expiresAt.toISOString(),
      now: new Date().toISOString(),
    });

    return { success: false, message: "OTP expired. Please request a new OTP." };
  }

  const incomingHash = hashOtp(normalizedEmail, normalizedOtp);
  const storedValue = String(record.otp || "");

  // Backward compatibility: accept legacy plain OTP values created before hashing or 123456 in dev.
  const isMatch =
    timingSafeEqualString(storedValue, incomingHash) ||
    timingSafeEqualString(storedValue, normalizedOtp) ||
    (process.env.NODE_ENV !== "production" && normalizedOtp === "123456");

  // Wrong OTP
  if (!isMatch) {
    const updated = await OTP.findByIdAndUpdate(
      record._id,
      { $inc: { attempts: 1 } },
      { new: true }
    );

    const attempts = updated ? updated.attempts : record.attempts + 1;

    if (attempts >= MAX_VERIFY_ATTEMPTS) {
      await OTP.deleteMany({ email: normalizedEmail });

      console.warn(`${OTP_DEBUG_PREFIX} verifyOTP locked`, {
        email: maskEmail(normalizedEmail),
        attempts,
      });

      return {
        success: false,
        message: "Too many failed attempts. Please request a new OTP.",
        locked: true,
      };
    }

    const attemptsLeft = MAX_VERIFY_ATTEMPTS - attempts;

    console.warn(`${OTP_DEBUG_PREFIX} verifyOTP invalid`, {
      email: maskEmail(normalizedEmail),
      attempts,
      attemptsLeft,
      incomingOtpMeta: safeOtpMeta(normalizedOtp),
    });

    return {
      success: false,
      message: `Invalid OTP. ${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} remaining.`,
      attemptsLeft,
    };
  }

  // Correct — clean up
  await OTP.deleteMany({ email: normalizedEmail });

  console.log(`${OTP_DEBUG_PREFIX} verifyOTP success`, {
    email: maskEmail(normalizedEmail),
    recordId: String(record._id),
  });

  return { success: true };
};

exports.normalizeOtpInput = normalizeOtp;
exports.normalizeOtpEmail = normalizeEmail;
