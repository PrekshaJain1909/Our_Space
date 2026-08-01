const jwt = require("jsonwebtoken");
const User = require("../models/User");
const tokenService = require("../service/tokenService");

const getBearerToken = (header = "") => {
  if (typeof header !== "string") return null;
  const trimmedHeader = header.trim();
  if (!trimmedHeader.startsWith("Bearer")) return null;
  const parts = trimmedHeader.split(/\s+/);
  if (parts.length < 2) return null;
  return parts[1];
};

exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = getBearerToken(authHeader);

  console.log("[auth] Authorization header:", authHeader || "(missing)");
  console.log("[auth] Extracted token:", token ? `${token.slice(0, 12)}...${token.slice(-6)}` : "(missing)");
  console.log("[auth] Token length:", token ? token.length : 0);

  if (!token) {
    console.warn("[auth] Authentication failed: missing or malformed Authorization header");
    return res.status(401).json({
      success: false,
      message: "Missing Authorization header. Provide a valid Bearer token.",
    });
  }

  try {
    const payload = tokenService.verifyAuthToken(token);
    console.log("[auth] Decoded JWT payload:", payload);

    if (!payload?.userId) {
      throw new Error("Token payload missing userId");
    }

    const user = await User.findById(payload.userId).select(
      "name email role coupleId isVerified gender"
    );

    if (!user) {
      console.warn("[auth] Authentication failed: user not found for token", { userId: payload.userId });
      return res.status(401).json({
        success: false,
        message: "User not found for provided token.",
      });
    }

    req.user = user;
    console.log("[auth] Authenticated user:", {
      id: user._id?.toString?.(),
      role: user.role,
      coupleId: user.coupleId?.toString?.(),
      isVerified: user.isVerified,
    });
    next();
  } catch (err) {
    console.error("[auth] JWT verification failed:", {
      name: err?.name,
      message: err?.message,
      stack: err?.stack,
    });

    const isTokenExpired = err?.name === "TokenExpiredError";
    const reason = err?.message === "JWT_SECRET is not configured"
      ? "Invalid JWT secret"
      : isTokenExpired
        ? "Token expired"
        : "Invalid or malformed token";
    const message = isTokenExpired
      ? "Session expired. Please log in again."
      : err?.message === "JWT_SECRET is not configured"
        ? "JWT secret is not configured on the server."
        : "Invalid authorization token.";

    return res.status(401).json({
      success: false,
      message,
      reason,
    });
  }
};

exports.requireVerifiedUser = (req, res, next) => {
  if (!req.user || !req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: "Please verify your account before accessing this feature.",
    });
  }

  next();
};

exports.requireCoupleMembership = (paramName = "coupleId") => {
  return (req, res, next) => {
    const requestedCoupleId =
      req.params[paramName] || req.body[paramName] || req.query[paramName];

    if (!requestedCoupleId) {
      return res.status(400).json({
        success: false,
        message: "Missing coupleId for authorization check.",
      });
    }

    if (!req.user?.coupleId) {
      return res.status(403).json({
        success: false,
        message: "User does not belong to any couple.",
      });
    }

    if (req.user.coupleId.toString() !== requestedCoupleId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this couple's data.",
      });
    }

    next();
  };
};

exports.requireCurrentUser = (paramName = "userId") => {
  return (req, res, next) => {
    const requestedUserId = req.params[paramName] || req.body[paramName] || req.query[paramName];

    if (!requestedUserId) {
      return res.status(400).json({
        success: false,
        message: "Missing userId for authorization check.",
      });
    }

    if (req.user._id.toString() !== requestedUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only manage your own user data.",
      });
    }

    next();
  };
};
