// service/otpService.js
const OTP = require("../models/OTP");

const OTP_EXPIRY_MINUTES = 5;

exports.generateOTP = () => {
  const i = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("Generating OTP...", i);
  return i;
};

exports.saveOTP = async (email, otp) => {
  const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

  // Remove old OTPs for this email
  await OTP.deleteMany({ email });

  const newOtp = new OTP({
    email,
    otp,
    expiresAt
  });

  await newOtp.save();
};

exports.verifyOTP = async (email, otp) => {
  const record = await OTP.findOne({ email, otp });

  if (!record) {
    return { success: false, message: "Invalid OTP" };
  }

  if (record.expiresAt < Date.now()) {
    return { success: false, message: "OTP expired" };
  }

  // Delete OTP after successful verification
  await OTP.deleteMany({ email });

  return { success: true };
};
