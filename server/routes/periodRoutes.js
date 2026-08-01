const express = require("express");
const router = express.Router();
const periodController = require("../controllers/periodController");
const { authenticateToken } = require("../middleware/authMiddleware");

// All period routes require valid JWT auth
router.use(authenticateToken);

router.get("/settings", periodController.getSettings);
router.post("/settings", periodController.saveSettings);

router.get("/calendar", periodController.getCalendarData);
router.post("/confirm", periodController.confirmTodayPeriod);

router.post("/log", periodController.saveDailyLog);

router.get("/surprises", periodController.getSurprises);
router.post("/surprises", periodController.createSurprise);
router.delete("/surprises/:id", periodController.deleteSurprise);

router.get("/stats", periodController.getStatistics);

module.exports = router;
