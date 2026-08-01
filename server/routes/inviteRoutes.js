const express = require("express");
const router = express.Router();
const inviteController = require("../controllers/inviteController");
const {
  authenticateToken,
  requireCoupleMembership,
} = require("../middleware/authMiddleware");

router.get("/verify/:token", inviteController.verifyInviteToken);
router.get(
  "/couple-status/:coupleId",
  authenticateToken,
  requireCoupleMembership("coupleId"),
  inviteController.getCoupleStatus
);
router.post("/register-partnerB", inviteController.registerPartnerB);
router.post("/send", authenticateToken, inviteController.sendInvite);

module.exports = router;
