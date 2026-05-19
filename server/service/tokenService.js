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
  return jwt.sign(
    { userId, email, role, coupleId }, 
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
};

exports.verifyAuthToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, { maxAge: JWT_EXPIRES });
};
