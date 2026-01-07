
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const requireAuth = require("../middleware/auth");

// All resources that MUST be private per user
const USER_OWNED_RESOURCES = new Set([
  "loveNotes",
  "buckets",
  "timeline",
  "memoryBox",
  "mood",
  "analytics",
  "healing",
  "playtime",
  "couples",
]);

function createResourceRouter(resourceName) {
  const router = express.Router();
  const isUserResource = USER_OWNED_RESOURCES.has(resourceName);


  /* ===================== LIST ===================== */
  // For loveNotes and all user-owned resources, require auth and always filter by userId
  if (isUserResource) {
    router.get("/", requireAuth, async (req, res) => {
      try {
        let items = await db.all(resourceName);
        const filtered = items.filter((i) => i.userId === req.user.id);
        console.log(`[${resourceName}] userId:`, req.user.id, '| total:', items.length, '| filtered:', filtered.length);
        res.json(filtered);
      } catch (e) {
        console.error("List error:", e);
        res.status(500).json({ message: "Internal error" });
      }
    });
  } else {
    router.get("/", async (req, res) => {
      try {
        let items = await db.all(resourceName);
        res.json(items);
      } catch (e) {
        console.error("List error:", e);
        res.status(500).json({ message: "Internal error" });
      }
    });
  }

  /* ===================== GET ONE ===================== */
  router.get("/:id", requireAuth, async (req, res) => {
    try {
      const item = await db.find(resourceName, req.params.id);

      if (!item || (isUserResource && item.userId !== req.user.id)) {
        return res.status(404).json({ message: "Not found" });
      }

      res.json(item);
    } catch (e) {
      console.error("Get error:", e);
      res.status(500).json({ message: "Internal error" });
    }
  });

  /* ===================== CREATE ===================== */
  router.post("/", requireAuth, async (req, res) => {
    try {
      const payload = req.body || {};

      // NEVER trust frontend for ownership
      delete payload.userId;
      delete payload.createdBy;

      const item = {
        id: uuidv4(),
        ...payload,
        createdAt: Date.now(),
        userId: req.user.id,
      };

      await db.create(resourceName, item);
      res.status(201).json(item);
    } catch (e) {
      console.error("Create error:", e);
      res.status(500).json({ message: "Internal error" });
    }
  });

  /* ===================== UPDATE ===================== */
  router.put("/:id", requireAuth, async (req, res) => {
    try {
      const item = await db.find(resourceName, req.params.id);

      if (!item || (isUserResource && item.userId !== req.user.id)) {
        return res.status(404).json({ message: "Not found" });
      }

      // Prevent ownership tampering
      const { userId, createdBy, ...safeBody } = req.body;

      const updated = await db.update(resourceName, req.params.id, {
        ...safeBody,
        updatedAt: Date.now(),
      });

      res.json(updated);
    } catch (e) {
      console.error("Update error:", e);
      res.status(500).json({ message: "Internal error" });
    }
  });

  /* ===================== DELETE ===================== */
  router.delete("/:id", requireAuth, async (req, res) => {
    try {
      const item = await db.find(resourceName, req.params.id);

      if (!item || (isUserResource && item.userId !== req.user.id)) {
        return res.status(404).json({ message: "Not found" });
      }

      await db.remove(resourceName, req.params.id);
      res.json({ ok: true });
    } catch (e) {
      console.error("Delete error:", e);
      res.status(500).json({ message: "Internal error" });
    }
  });

  return router;
}

module.exports = createResourceRouter;
