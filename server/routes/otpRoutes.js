const express = require("express");
const router = express.Router();
const otpController = require("../controllers/otpController");

router.post("/verify", otpController.verifyOTP);
router.post("/resend", otpController.resendOTP);

module.exports = router;
