const rateLimit = require("express-rate-limit");

exports.otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 min
  max: 3, // 3 OTP requests per window
  message: "Too many OTP requests. Try again later."
});
