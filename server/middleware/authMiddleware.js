const jwt = require("jsonwebtoken");
const User = require("../models/User");
const tokenService = require("../service/tokenService");

const getBearerToken = (header = "") => {
  if (typeof header !== "string") return null;
  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  return parts[1];
};

exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = getBearerToken(authHeader);
  console.log('[auth] Authorization header present?', !!authHeader, 'extracted token?', !!token);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authorization required. Provide a valid Bearer token.",
    });
  }

  try {
    const payload = tokenService.verifyAuthToken(token);
    console.log('[auth] token payload:', { userId: payload?.userId, coupleId: payload?.coupleId });

    if (!payload?.userId) {
      throw new Error("Token payload missing userId");
    }

    const user = await User.findById(payload.userId).select(
      "name email role coupleId isVerified"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found for provided token.",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    const isTokenExpired = err.name === "TokenExpiredError";
    const message = isTokenExpired
      ? "Session expired. Please log in again."
      : "Invalid authorization token.";

    return res.status(401).json({
      success: false,
      message,
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
