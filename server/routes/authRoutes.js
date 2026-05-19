const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.post("/register", authController.registerPartnerA);
router.post("/login", authController.login);
router.post("/refresh", authenticateToken, authController.refreshToken);

module.exports = router;
