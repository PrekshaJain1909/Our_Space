// controllers/inviteController.js

const Couple = require("../models/Couple");
const User = require("../models/User");

const { asyncHandler } = require("../middleware/asyncHandler");

const otpService = require("../service/otpService");
const mailService = require("../service/mailService");
const passwordService = require("../service/passwordService");

const resolveCoupleFromInvite = async ({ token, coupleId }) => {
  if (token) {
    // Accept token-based links even if inviteExpires has passed so old links do not break.
    const coupleFromToken = await Couple.findOne({ inviteToken: token });
    if (coupleFromToken) return coupleFromToken;
  }

  if (coupleId) {
    try {
      const directCouple = await Couple.findById(coupleId);
      if (directCouple) return directCouple;
    } catch (err) {
      // Invalid ObjectId format; continue to user fallback
    }

    try {
      // Backward compatibility: older clients shared partnerA userId in /join/:id links.
      const user = await User.findById(coupleId);
      if (user?.coupleId) {
        const coupleFromUser = await Couple.findById(user.coupleId);
        if (coupleFromUser) return coupleFromUser;
      }
    } catch (err) {
      // Invalid ObjectId format
    }
  }

  return null;
};

exports.verifyInviteToken = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const couple = await resolveCoupleFromInvite({ token });

  if (!couple) {
    return res.status(400).json({ message: "Invalid invite token" });
  }

  res.json({
    message: "Token valid",
    coupleName: couple.coupleName,
    coupleId: couple._id,
  });
});

exports.registerPartnerB = asyncHandler(async (req, res) => {
  const { token, coupleId, name, email, password } = req.body;

  if (!token && !coupleId) {
    return res
      .status(400)
      .json({ message: "Invalid invite: No token or coupleId provided" });
  }

  const couple = await resolveCoupleFromInvite({ token, coupleId });

  if (!couple) {
    let debugMsg = "Invalid invite";
    if (token && coupleId) {
      debugMsg = `Invite not found: token and coupleId both invalid`;
    } else if (token) {
      debugMsg = `Invite token not found`;
    } else if (coupleId) {
      debugMsg = `Couple ${coupleId} not found`;
    }
    return res.status(400).json({ message: debugMsg });
  }

  if (couple.partnerB) {
    return res.status(400).json({
      message: "Partner already joined this couple",
    });
  }

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

exports.getCoupleStatus = asyncHandler(async (req, res) => {
  const { coupleId } = req.params;

  const couple = await Couple.findById(coupleId).select("isActive partnerA partnerB");

  if (!couple) {
    return res.status(404).json({ message: "Couple not found" });
  }

  res.json({
    coupleId: couple._id,
    isActive: Boolean(couple.isActive),
    isComplete: Boolean(couple.partnerA && couple.partnerB),
  });
});
