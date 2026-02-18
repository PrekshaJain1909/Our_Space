// controllers/otpController.js

const User = require("../models/User");
const Couple = require("../models/Couple");

const { asyncHandler } = require("../middleware/asyncHandler");

const otpService = require("../service/otpService");

const jwt = require("jsonwebtoken");

exports.verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // 1️⃣ Find user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // 2️⃣ Verify OTP
  const result = await otpService.verifyOTP(email, otp);

  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }

  // 3️⃣ Mark verified
  user.isVerified = true;
  await user.save();

  // 4️⃣ Activate couple if both verified
  if (user.coupleId) {
  const couple = await Couple.findById(user.coupleId)
  .populate("partnerA", "isVerified")
  .populate("partnerB", "isVerified");


    if (
      couple &&
      couple.partnerA &&
      couple.partnerB &&
      couple.partnerA.isVerified &&
      couple.partnerB.isVerified
    ) {
      couple.isActive = true;
      await couple.save();
    }
  }

  // 5️⃣ Generate JWT
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  ); 

res.json({
  message: "OTP verified successfully",
  token,
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    coupleId: user.coupleId,
    isVerified: user.isVerified,
    isActive: user.isActive,
  }
});

});
