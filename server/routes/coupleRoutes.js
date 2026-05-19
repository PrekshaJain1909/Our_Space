const express = require("express");
const router = express.Router();
const coupleController = require("../controllers/coupleController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.post("/", authenticateToken, coupleController.createCouple);
router.get("/", authenticateToken, coupleController.getCouple);
router.put("/", authenticateToken, coupleController.updateCouple);
router.patch("/", authenticateToken, coupleController.patchCouple);
router.put("/photo", authenticateToken, coupleController.updatePhoto);
router.delete("/", authenticateToken, coupleController.deleteCouple);

module.exports = router;
