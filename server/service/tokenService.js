// service/tokenService.js
const crypto = require("crypto");

const INVITE_EXPIRY_HOURS = 24;

exports.generateInviteToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

exports.getInviteExpiry = () => {
  return Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000;
};

exports.buildInviteLink = (token) => {
  return `${process.env.FRONTEND_URL}/invite/${token}`;
};
