// controllers/authController.js

const User = require("../models/User");
const Couple = require("../models/Couple");

const { asyncHandler } = require("../middleware/asyncHandler");

const otpService = require("../service/otpService");
const tokenService = require("../service/tokenService");
const mailService = require("../service/mailService");
const passwordService = require("../service/passwordService");

exports.registerPartnerA = asyncHandler(async (req, res) => {
  const { coupleName, name, email, password } = req.body;
  const normalizedEmail = otpService.normalizeOtpEmail(email);

  // 1️⃣ Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    if (!existingUser.isVerified) {
      // Resend OTP — enforce cooldown and resend limits
      const otp = otpService.generateOTP();
      const saveResult = await otpService.saveOTP(normalizedEmail, otp, true);

      if (!saveResult.success) {
        const status = saveResult.waitSeconds ? 429 : 400;
        return res.status(status).json({
          message: saveResult.message,
          ...(saveResult.waitSeconds && { waitSeconds: saveResult.waitSeconds }),
        });
      }

      await mailService.sendOTPEmail(normalizedEmail, otp);

      return res.status(200).json({
        message: "User already registered but not verified. OTP resent.",
      });
    }

    return res.status(400).json({ message: "User already exists" });
  }

  // 2️⃣ Hash password
  const hashedPassword = await passwordService.hashPassword(password);

  // 3️⃣ Create Partner A
  const userA = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role: "partnerA",
    isVerified: false,
  });

  // 4️⃣ Generate invite token
  const inviteToken = tokenService.generateInviteToken();
  const inviteExpires = tokenService.getInviteExpiry();

  // 5️⃣ Create couple
  const couple = await Couple.create({
    coupleName,
    partnerA: userA._id,
    inviteToken,
    inviteExpires,
    isActive: false,
  });

  // 6️⃣ Attach coupleId to user
  userA.coupleId = couple._id;
  await userA.save();

  // 7️⃣ Generate & Save OTP
  const otp = otpService.generateOTP();
  await otpService.saveOTP(normalizedEmail, otp);

  // 8️⃣ Send Emails
  const inviteLink = tokenService.buildInviteLink(inviteToken);

  await mailService.sendOTPEmail(normalizedEmail, otp);

  res.status(201).json({
    message: "Partner A registered. Verify OTP.",
    inviteLink,
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const normalizedEmail = (email || "").toString().trim().toLowerCase();
  const normalizedPassword = (password || "").toString().trim();

  if (!normalizedEmail || !normalizedPassword) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Find user by email
  const user = await User.findOne({ email: normalizedEmail }).populate(
    "coupleId",
    "coupleName isActive partnerA partnerB"
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isMatch = await passwordService.comparePassword(normalizedPassword, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (!user.isVerified) {
    return res.status(403).json({
      message: "Please verify your OTP before logging in.",
      code: "USER_UNVERIFIED",
      email: user.email,
      userId: user._id,
    });
  }

  const token = tokenService.generateAuthToken({
    userId: user._id,
    email: user.email,
    role: user.role,
    coupleId: user.coupleId,
  });

  res.json({
    message: "Login successful",
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      coupleId: user.coupleId,
      isVerified: user.isVerified,
      isActive: Boolean(user.coupleId?.isActive),
      coupleName: user.coupleId?.coupleName || null,
    },
  });
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: "Invalid session" });
  }

  const newToken = tokenService.generateAuthToken({
    userId: user._id,
    email: user.email,
    role: user.role,
    coupleId: user.coupleId,
  });

  res.json({ token: newToken });
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: 'Not authenticated' });

  res.json({ success: true, message: 'Current user', user });
});

exports.logout = asyncHandler(async (req, res) => {
  // For stateless JWTs there's nothing to invalidate server-side by default.
  // If refresh tokens or server-side sessions are used, clear them here.
  res.json({ success: true, message: 'Logged out' });
});

// POST /api/auth/resend-otp  – simple wrapper so clients can call this under /api/auth
exports.resendOtp = asyncHandler(async (req, res) => {
  const { email, userId } = req.body;

  const normalizedEmail = otpService.normalizeOtpEmail(email);

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
