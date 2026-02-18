// controllers/inviteController.js

const Couple = require("../models/Couple");
const User = require("../models/User");

const { asyncHandler } = require("../middleware/asyncHandler");

const otpService = require("../service/otpService");
const mailService = require("../service/mailService");
const passwordService = require("../service/passwordService");

exports.verifyInviteToken = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const couple = await Couple.findOne({
    inviteToken: token,
    inviteExpires: { $gt: Date.now() },
  });

  if (!couple) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  res.json({
    message: "Token valid",
    coupleName: couple.coupleName,
  });
});

exports.registerPartnerB = asyncHandler(async (req, res) => {
  const { token, name, email, password } = req.body;

  const couple = await Couple.findOne({
    inviteToken: token,
    inviteExpires: { $gt: Date.now() },
  });

  if (!couple) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    if (!existingUser.isVerified) {
      // resend OTP
      const otp = otpService.generateOTP();
      await otpService.saveOTP(email, otp);
      await mailService.sendOTPEmail(email, otp);

      return res.status(200).json({
        message: "User already registered but not verified. OTP resent.",
      });
    }

    return res.status(400).json({ message: "User already exists" });
  }

  // Hash password
  const hashedPassword = await passwordService.hashPassword(password);

  // Create Partner B
  const userB = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "partnerB",
    coupleId: couple._id,
    isVerified: false,
  });

  // Attach to couple
  couple.partnerB = userB._id;
  await couple.save();

  // Generate & Save OTP
  const otp = otpService.generateOTP();
  await otpService.saveOTP(email, otp);

  // Send OTP Email
  await mailService.sendOTPEmail(email, otp);

  res.status(201).json({
    message: "Partner B registered. Verify OTP.",
  });
});
