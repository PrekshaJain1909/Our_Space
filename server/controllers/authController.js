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

  // 1️⃣ Check if user already exists
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

    return res.status(400).json({ message: "User already exists why" });
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
  await mailService.sendInviteEmail(email, inviteLink);

  res.status(201).json({
    message: "Partner A registered. Verify OTP.",
    inviteLink,
  });
});
