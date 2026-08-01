// controllers/inviteController.js

const Couple = require("../models/Couple");
const User = require("../models/User");

const { asyncHandler } = require("../middleware/asyncHandler");

const otpService = require("../service/otpService");
const mailService = require("../service/mailService");
const passwordService = require("../service/passwordService");
const tokenService = require("../service/tokenService");
const { asyncHandler: _asyncHandler } = require("../middleware/asyncHandler");

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
  const normalizedEmail = otpService.normalizeOtpEmail(email);

  if (!token && !coupleId) {
    return res
      .status(400)
      .json({ message: "Invalid invite: No token or coupleId provided" });
  }

  if (!name || !String(name).trim()) {
    return res.status(400).json({ message: "Your name is required." });
  }
  if (!normalizedEmail) {
    return res.status(400).json({ message: "A valid email address is required." });
  }
  if (!password || !String(password).trim()) {
    return res.status(400).json({ message: "A password is required." });
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

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    if (!existingUser.isVerified) {
      // Resend OTP — enforce cooldown and resend limits
      const otp = otpService.generateOTP();
      const saveResult = await otpService.saveOTP(normalizedEmail, otp, true);

      if (!saveResult.success) {
        const status = saveResult.waitSeconds ? 429 : 400;
        console.error("[invite] saveOTP resend failed", {
          email: normalizedEmail,
          message: saveResult.message,
          waitSeconds: saveResult.waitSeconds,
        });
        return res.status(status).json({
          message: saveResult.message,
          ...(saveResult.waitSeconds && { waitSeconds: saveResult.waitSeconds }),
        });
      }

      try {
        console.log("[invite] Resend OTP sending email", {
          email: normalizedEmail,
          otp,
        });
        await mailService.sendOTPEmail(normalizedEmail, otp);
        console.log("[invite] Resend OTP email sent", { email: normalizedEmail });
      } catch (err) {
        console.error("[invite] Resend OTP email failed", {
          email: normalizedEmail,
          message: err.message,
          statusCode: err.response?.status || err.status,
          response: err.response?.data,
          stack: err.stack,
        });

        if (err.isEmailError) {
          return res.status(502).json({ message: "Unable to resend OTP email. Please try again later." });
        }

        throw err;
      }

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
    email: normalizedEmail,
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
  const saveResult = await otpService.saveOTP(normalizedEmail, otp);

  if (!saveResult.success) {
    console.error("[OTP][Controller] saveOTP failed for partnerB", {
      email: normalizedEmail,
      message: saveResult.message,
    });
    return res.status(500).json({ message: "Unable to generate OTP. Please try again." });
  }

  // Send OTP Email
  const localHosts = ["localhost", "127.0.0.1", "0.0.0.0", "::1", "::ffff:127.0.0.1"];
  const isLocalHost = localHosts.includes(req.hostname) || localHosts.includes(req.ip);
  console.log("[OTP][Controller] sending OTP email for partnerB", {
    email: normalizedEmail,
    isLocalHost,
    reqHostname: req.hostname,
    reqIp: req.ip,
  });

  try {
    await mailService.sendOTPEmail(normalizedEmail, otp);
  } catch (err) {
    console.error("[OTP][Controller] OTP email failed for partnerB", {
      email: normalizedEmail,
      isLocalHost,
      message: err.message,
      statusCode: err.response?.status || err.status,
      response: err.response?.data,
    });

    if (err.isEmailError) {
      if (process.env.NODE_ENV !== "production" || isLocalHost) {
        console.warn("[invite] OTP email failed on local request, continuing registration:", err.message);
      } else {
        return res.status(502).json({ message: "Unable to send OTP email. Please try again later." });
      }
    } else {
      throw err;
    }
  }

  res.status(201).json({
    success: true,
    message: "Partner B registered. Verify OTP.",
  });
});

exports.sendInvite = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user || !user.coupleId) {
    return res.status(400).json({ message: 'User does not belong to a couple' });
  }

  const couple = await Couple.findById(user.coupleId);
  if (!couple) return res.status(404).json({ message: 'Couple not found' });

  // Generate a fresh invite token and expiry
  const inviteToken = tokenService.generateInviteToken();
  const inviteExpires = tokenService.getInviteExpiry();

  couple.inviteToken = inviteToken;
  couple.inviteExpires = inviteExpires;
  await couple.save();

  const inviteLink = tokenService.buildInviteLink(inviteToken);

  // Optionally send to an email if provided
  const { email } = req.body;
  if (email) {
    const normalized = otpService.normalizeOtpEmail(email);
    await mailService.sendInviteEmail(normalized, inviteLink);
  }

  res.json({ message: 'Invite created', inviteLink });
});

exports.getCoupleStatus = asyncHandler(async (req, res) => {
  const { coupleId } = req.params;

  const couple = await Couple.findById(coupleId).select("isActive partnerA partnerB");

  if (!couple) {
    return res.status(404).json({ message: "Couple not found" });
  }

  if (!req.user?.coupleId || req.user.coupleId.toString() !== couple._id.toString()) {
    return res.status(403).json({ message: "Not authorized to view this couple." });
  }

  res.json({
    coupleId: couple._id,
    isActive: Boolean(couple.isActive),
    isComplete: Boolean(couple.partnerA && couple.partnerB),
    hasPartnerA: Boolean(couple.partnerA),
    hasPartnerB: Boolean(couple.partnerB),
  });
});
