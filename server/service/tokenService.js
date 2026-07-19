// service/tokenService.js
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const INVITE_EXPIRY_HOURS = 24;
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== "production" ? "dev-secret" : null);
  console.log("[auth] JWT config:", {
    nodeEnv: process.env.NODE_ENV || "development",
    secretConfigured: Boolean(secret),
    expiresIn: JWT_EXPIRES,
  });
  return secret;
};

exports.generateInviteToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

exports.getInviteExpiry = () => {
  return Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000;
};

exports.buildInviteLink = (token) => {
  return `${process.env.FRONTEND_URL}/invite/${token}`;
};

exports.generateAuthToken = ({ userId, email, role, coupleId }) => {
  const secret = getJwtSecret();
  if (!secret) {
    console.error("[auth] JWT generation failed: JWT_SECRET is not configured");
    throw new Error("JWT_SECRET is not configured");
  }

  const payload = { userId, email, role, coupleId };
  console.log("[auth] Signing JWT payload:", {
    userId: payload.userId?.toString?.() || payload.userId,
    email: payload.email,
    role: payload.role,
    coupleId: payload.coupleId?.toString?.() || payload.coupleId,
  });

  return jwt.sign(payload, secret, { expiresIn: JWT_EXPIRES });
};

exports.verifyAuthToken = (token) => {
  const secret = getJwtSecret();
  if (!secret) {
    console.error("[auth] JWT verification failed: JWT_SECRET is not configured");
    throw new Error("JWT_SECRET is not configured");
  }

  try {
    const payload = jwt.verify(token, secret);
    console.log("[auth] JWT verified successfully:", {
      userId: payload?.userId,
      role: payload?.role,
      coupleId: payload?.coupleId,
    });
    return payload;
  } catch (err) {
    console.error("[auth] JWT verification error:", {
      name: err?.name,
      message: err?.message,
    });
    throw err;
  }
};
