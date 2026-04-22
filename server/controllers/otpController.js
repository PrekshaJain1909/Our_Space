// controllers/otpController.js

const User = require("../models/User");
const Couple = require("../models/Couple");

const { asyncHandler } = require("../middleware/asyncHandler");

const otpService = require("../service/otpService");
const mailService = require("../service/mailService");

const jwt = require("jsonwebtoken");

exports.verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp, userId } = req.body;

  const normalizedEmail = (email || "").trim().toLowerCase();

  if (!normalizedEmail && !userId) {
    return res.status(400).json({ message: "Email or userId is required" });
  }

  // 1️⃣ Find user
  const user = userId
    ? await User.findById(userId)
    : await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const otpTargetEmail = (user.email || "").trim().toLowerCase();

  // 2️⃣ Verify OTP (tracks attempts, expiry, lock)
  const result = await otpService.verifyOTP(otpTargetEmail, otp);

  if (!result.success) {
    const status = result.locked ? 423 : 400;
    return res.status(status).json({
      message: result.message,
      ...(result.attemptsLeft !== undefined && { attemptsLeft: result.attemptsLeft }),
      ...(result.locked && { locked: true }),
    });
  }

  // 3️⃣ Mark verified
  user.isVerified = true;
  await user.save();

  // 4️⃣ Activate couple if both verified
  let coupleIsActive = false;
  if (user.coupleId) {
    const couple = await Couple.findById(user.coupleId)
      .populate("partnerA", "isVerified")
      .populate("partnerB", "isVerified");

    if (
      couple &&
      couple.partnerA &&
      couple.partnerB &&
      couple.partnerA.isVerified &&
      couple.partnerB.isVerified
    ) {
      couple.isActive = true;
      await couple.save();
    }

    coupleIsActive = couple ? couple.isActive : false;
  }

  // 5️⃣ Generate JWT
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    message: "OTP verified successfully",
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      coupleId: user.coupleId,
      isVerified: user.isVerified,
      isActive: coupleIsActive,
    },
  });
});

// POST /api/otp/resend  –  request a new OTP without re-registering
exports.resendOTP = asyncHandler(async (req, res) => {
  const { email, userId } = req.body;

  const normalizedEmail = (email || "").trim().toLowerCase();

  if (!normalizedEmail && !userId) {
    return res.status(400).json({ message: "Email or userId is required" });
  }

  const user = userId
    ? await User.findById(userId)
    : await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.isVerified) {
    return res.status(400).json({ message: "This account is already verified" });
  }

  const otp = otpService.generateOTP();
  const targetEmail = (user.email || "").trim().toLowerCase();
  const result = await otpService.saveOTP(targetEmail, otp, true);

  if (!result.success) {
    const status = result.waitSeconds ? 429 : 400;
    return res.status(status).json({
      message: result.message,
      ...(result.waitSeconds && { waitSeconds: result.waitSeconds }),
    });
  }

  await mailService.sendOTPEmail(targetEmail, otp);

  res.json({ message: "A new OTP has been sent to your email." });
});

