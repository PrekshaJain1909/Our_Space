const express = require("express");
const router = express.Router();
const inviteController = require("../controllers/inviteController");

router.get("/verify/:token", inviteController.verifyInviteToken);
router.post("/register-partnerB", inviteController.registerPartnerB);

module.exports = router;
