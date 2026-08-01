const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.post("/register", authController.registerPartnerA);
router.post("/login", authController.login);
router.post("/resend-otp", authController.resendOtp);
router.post("/refresh", authenticateToken, authController.refreshToken);
router.get("/me", authenticateToken, authController.getMe);
router.post("/logout", authenticateToken, authController.logout);

module.exports = router;
