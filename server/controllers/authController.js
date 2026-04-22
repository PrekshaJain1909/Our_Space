// controllers/authController.js

const User = require("../models/User");
const Couple = require("../models/Couple");

const { asyncHandler } = require("../middleware/asyncHandler");

const otpService = require("../service/otpService");
const tokenService = require("../service/tokenService");
const mailService = require("../service/mailService");
const passwordService = require("../service/passwordService");
const jwt = require("jsonwebtoken");

exports.registerPartnerA = asyncHandler(async (req, res) => {
  const { coupleName, name, email, password } = req.body;

  // 1️⃣ Check if user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    if (!existingUser.isVerified) {
      // Resend OTP — enforce cooldown and resend limits
      const otp = otpService.generateOTP();
      const saveResult = await otpService.saveOTP(email, otp, true);

      if (!saveResult.success) {
        const status = saveResult.waitSeconds ? 429 : 400;
        return res.status(status).json({
          message: saveResult.message,
          ...(saveResult.waitSeconds && { waitSeconds: saveResult.waitSeconds }),
        });
      }

      await mailService.sendOTPEmail(email, otp);

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
    email,
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
  await otpService.saveOTP(email, otp);

  // 8️⃣ Send Emails
  const inviteLink = tokenService.buildInviteLink(inviteToken);

  await mailService.sendOTPEmail(email, otp);

  res.status(201).json({
    message: "Partner A registered. Verify OTP.",
    inviteLink,
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { name, coupleName, password } = req.body;

  const normalizedCoupleName = (coupleName || name || "").trim();
  const normalizedPassword = (password || "").trim();

  if (!normalizedCoupleName || !normalizedPassword) {
    return res.status(400).json({ message: "Couple name and password are required" });
  }

  const escapedCoupleName = normalizedCoupleName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const couple = await Couple.findOne({
    coupleName: { $regex: `^${escapedCoupleName}$`, $options: "i" },
  })
    .populate("partnerA", "name email password role coupleId isVerified")
    .populate("partnerB", "name email password role coupleId isVerified");

  if (!couple) {
    return res.status(401).json({ message: "Invalid couple name or password" });
  }

  const candidates = [couple.partnerA, couple.partnerB].filter(Boolean);

  let matchedUser = null;
  for (const candidate of candidates) {
    const isMatch = await passwordService.comparePassword(normalizedPassword, candidate.password);
    if (isMatch) {
      matchedUser = candidate;
      break;
    }
  }

  if (!matchedUser) {
    return res.status(401).json({ message: "Invalid couple name or password" });
  }

  if (!matchedUser.isVerified) {
    return res.status(403).json({
      message: "Please verify your OTP before logging in.",
      code: "USER_UNVERIFIED",
      email: matchedUser.email,
      userId: matchedUser._id,
    });
  }

  // Detect when this user is verified but their partner hasn't verified yet
  let partnerPending = false;
  if (couple.partnerA && couple.partnerB && !couple.isActive) {
    const otherPartner = couple.partnerA._id.equals(matchedUser._id)
      ? couple.partnerB
      : couple.partnerA;
    if (otherPartner && !otherPartner.isVerified) {
      partnerPending = true;
    }
  }

  const token = jwt.sign(
    { userId: matchedUser._id, email: matchedUser.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    message: "Login successful",
    token,
    user: {
      _id: matchedUser._id,
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
      coupleId: matchedUser.coupleId,
      isVerified: matchedUser.isVerified,
      isActive: Boolean(couple.isActive),
      coupleName: couple.coupleName,
      partnerPending,
    },
  });
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const newToken = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token: newToken });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
});
