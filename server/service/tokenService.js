// service/tokenService.js
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const INVITE_EXPIRY_HOURS = 24;
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

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
  const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-secret' : null);
  if (!secret) throw new Error('JWT_SECRET is not configured');

  return jwt.sign({ userId, email, role, coupleId }, secret, { expiresIn: JWT_EXPIRES });
};

exports.verifyAuthToken = (token) => {
  const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-secret' : null);
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return jwt.verify(token, secret, { maxAge: JWT_EXPIRES });
};
