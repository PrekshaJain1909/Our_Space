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

  console.log("[OTP][Controller] registerPartnerA request", {
    coupleName: coupleName?.trim(),
    name: name?.trim(),
    email: normalizedEmail,
    hasPassword: Boolean(password),
  });

  if (!coupleName || !String(coupleName).trim()) {
    console.log("[OTP][Controller] Validation failed: coupleName missing");
    return res.status(400).json({ message: "Couple name is required." });
  }
  if (!name || !String(name).trim()) {
    console.log("[OTP][Controller] Validation failed: name missing");
    return res.status(400).json({ message: "Your name is required." });
  }
  if (!normalizedEmail) {
    console.log("[OTP][Controller] Validation failed: invalid email", { email });
    return res.status(400).json({ message: "A valid email address is required." });
  }
  if (!password || !String(password).trim()) {
    console.log("[OTP][Controller] Validation failed: password missing");
    return res.status(400).json({ message: "A password is required." });
  }

  try {
    // 1️⃣ Check if user already exists
    console.log("[OTP][Controller] Looking up existing user", { email: normalizedEmail });
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      console.log("[OTP][Controller] Existing user found", {
        email: normalizedEmail,
        isVerified: existingUser.isVerified,
      });

      if (!existingUser.isVerified) {
        console.log("[OTP][Controller] Resending OTP for unverified user");
        const otp = otpService.generateOTP();
        const saveResult = await otpService.saveOTP(normalizedEmail, otp, true);

        if (!saveResult.success) {
          console.error("[OTP][Controller] saveOTP failed during resend", {
            email: normalizedEmail,
            message: saveResult.message,
            waitSeconds: saveResult.waitSeconds,
          });
          const status = saveResult.waitSeconds ? 429 : 400;
          return res.status(status).json({
            message: saveResult.message,
            ...(saveResult.waitSeconds && { waitSeconds: saveResult.waitSeconds }),
          });
        }

        console.log("[OTP][Controller] OTP saved for resend", { email: normalizedEmail, otp });
        try {
          await mailService.sendOTPEmail(normalizedEmail, otp);
          console.log("[OTP][Controller] Resend email sent", { email: normalizedEmail });
        } catch (err) {
          console.error("[OTP][Controller] resend OTP email failed", {
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
          success: true,
          message: "User already registered but not verified. OTP resent.",
        });
      }

      console.log("[OTP][Controller] Registration aborted: user already exists", { email: normalizedEmail });
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // 2️⃣ Hash password
    console.log("[OTP][Controller] Hashing user password");
    const hashedPassword = await passwordService.hashPassword(password);

    // 3️⃣ Create Partner A
    console.log("[OTP][Controller] Creating Partner A user");
    const userA = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "partnerA",
      isVerified: false,
    });
    console.log("[OTP][Controller] Partner A created", { userId: String(userA._id) });

    // 4️⃣ Generate invite token
    const inviteToken = tokenService.generateInviteToken();
    const inviteExpires = tokenService.getInviteExpiry();

    // 5️⃣ Create couple
    console.log("[OTP][Controller] Creating couple record", {
      coupleName,
      partnerA: String(userA._id),
    });
    const couple = await Couple.create({
      coupleName,
      partnerA: userA._id,
      inviteToken,
      inviteExpires,
      isActive: false,
    });
    console.log("[OTP][Controller] Couple created", { coupleId: String(couple._id) });

    // 6️⃣ Attach coupleId to user
    userA.coupleId = couple._id;
    await userA.save();
    console.log("[OTP][Controller] User updated with coupleId", {
      userId: String(userA._id),
      coupleId: String(couple._id),
    });

    // 7️⃣ Generate & Save OTP
    console.log("[OTP][Controller] Generating OTP");
    const otp = otpService.generateOTP();
    const saveResult = await otpService.saveOTP(normalizedEmail, otp);

    if (!saveResult.success) {
      console.error("[OTP][Controller] saveOTP failed", {
        email: normalizedEmail,
        message: saveResult.message,
      });
      return res.status(500).json({ message: "Unable to generate OTP. Please try again." });
    }

    console.log("[OTP][Controller] OTP saved", {
      email: normalizedEmail,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });

    // 8️⃣ Send Emails
    const inviteLink = tokenService.buildInviteLink(inviteToken);
    const isLocalHost = ["localhost", "127.0.0.1", "0.0.0.0"].includes(req.hostname);

    console.log("[OTP][Controller] sending OTP email", {
      email: normalizedEmail,
      isLocalHost,
      inviteLink,
    });

    try {
      await mailService.sendOTPEmail(normalizedEmail, otp);
      console.log("[OTP][Controller] OTP email sent successfully", { email: normalizedEmail });
    } catch (err) {
      console.error("[OTP][Controller] OTP email failed", {
        email: normalizedEmail,
        isLocalHost,
        message: err.message,
        statusCode: err.response?.status || err.status,
        response: err.response?.data,
        stack: err.stack,
      });

      if (err.isEmailError) {
        if (process.env.NODE_ENV !== "production" || isLocalHost) {
          console.warn("[auth] OTP email failed on local request, continuing registration:", err.message);
        } else {
          return res.status(502).json({ message: "Unable to send OTP email. Please try again later." });
        }
      } else {
        console.error("[OTP][Controller] Unexpected error during OTP send", { email: normalizedEmail });
        throw err;
      }
    }

    console.log("[OTP][Controller] Registration complete", {
      email: normalizedEmail,
      userId: String(userA._id),
      coupleId: String(couple._id),
    });

    return res.status(201).json({
      success: true,
      message: "Partner A registered. Verify OTP.",
      inviteLink,
    });
  } catch (err) {
    console.error("[OTP][Controller] registerPartnerA unexpected error", {
      email: normalizedEmail,
      message: err.message,
      stack: err.stack,
    });

    if (err.isEmailError) {
      return res.status(503).json({
        success: false,
        message: err.message,
        ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
      });
    }

    throw err;
  }
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

  const tokenPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    coupleId: user.coupleId,
  };

  console.log("[auth] Login token payload:", {
    userId: tokenPayload.userId?.toString?.() || tokenPayload.userId,
    email: tokenPayload.email,
    role: tokenPayload.role,
    coupleId: tokenPayload.coupleId?.toString?.() || tokenPayload.coupleId,
  });

  const token = tokenService.generateAuthToken(tokenPayload);

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
      success: false,
      message: result.message,
      ...(result.waitSeconds && { waitSeconds: result.waitSeconds }),
    });
  }

  await mailService.sendOTPEmail(targetEmail, otp);

  res.json({ success: true, message: "A new OTP has been sent to your email." });
});
