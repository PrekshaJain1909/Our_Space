const express = require("express");
const memoryController = require("../controllers/memoryController");
const { authenticateToken } = require("../middleware/authMiddleware");
const { ensureObjectId, limitOffset } = require("../middleware/validate");
const multer = require("multer");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image files are allowed."));
        }
        cb(null, true);
    },
});

const router = express.Router();

router.post("/", authenticateToken, upload.array("photos", 100), memoryController.createMemory);
router.get("/", authenticateToken, limitOffset(100), memoryController.getMemories);
router.get("/folders", authenticateToken, memoryController.getFolders);
router.get("/albums", authenticateToken, memoryController.getAlbums);
router.get("/albums/delete-requests", authenticateToken, memoryController.getAlbumDeleteRequests);
router.get("/albums/:id", authenticateToken, ensureObjectId("id"), memoryController.getAlbumById);
router.post("/albums", authenticateToken, memoryController.createAlbum);
router.post("/albums/:albumId/photos", authenticateToken, ensureObjectId("albumId"), upload.array("photos", 100), memoryController.uploadPhotosToAlbum);
router.post("/albums/:id/delete-request", authenticateToken, ensureObjectId("id"), memoryController.createAlbumDeleteRequest);
router.patch("/albums/delete-request/:id/approve", authenticateToken, ensureObjectId("id"), memoryController.approveAlbumDeleteRequest);
router.patch("/albums/delete-request/:id/reject", authenticateToken, ensureObjectId("id"), memoryController.rejectAlbumDeleteRequest);
router.patch("/albums/:id", authenticateToken, ensureObjectId("id"), memoryController.updateAlbum);
router.delete("/albums/:id", authenticateToken, ensureObjectId("id"), memoryController.deleteAlbum);
router.get("/favorites", authenticateToken, memoryController.getFavorites);
router.get("/deleted", authenticateToken, memoryController.getDeleted);
router.post("/restore/:id", authenticateToken, ensureObjectId("id"), memoryController.restoreMemory);
router.delete("/permanent/:id", authenticateToken, ensureObjectId("id"), memoryController.deleteForever);
router.get("/timeline", authenticateToken, memoryController.getTimeline);
router.get("/on-this-day", authenticateToken, memoryController.getOnThisDay);
router.get("/stats", authenticateToken, memoryController.getStats);
router.get("/:id", authenticateToken, ensureObjectId("id"), memoryController.getMemoryById);
router.put("/:id", authenticateToken, ensureObjectId("id"), upload.array("photos", 100), memoryController.updateMemory);
router.delete("/:id", authenticateToken, ensureObjectId("id"), memoryController.deleteMemory);
router.patch("/:id/favourite", authenticateToken, ensureObjectId("id"), memoryController.toggleFavourite);
router.patch("/:id/pin", authenticateToken, ensureObjectId("id"), memoryController.togglePin);
router.post("/:id/react", authenticateToken, ensureObjectId("id"), memoryController.reactToMemory);
router.delete("/:id/react", authenticateToken, ensureObjectId("id"), memoryController.removeReaction);
router.post("/:id/comment", authenticateToken, ensureObjectId("id"), memoryController.addComment);
router.delete("/comments/:id", authenticateToken, ensureObjectId("id"), memoryController.deleteComment);

module.exports = router;
