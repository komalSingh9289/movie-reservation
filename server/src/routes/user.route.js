import express from "express";
import User from "../models/user.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /users/sync:
 *   post:
 *     summary: Sync Clerk user with DB
 *     tags: [Users]
 */
router.post("/sync", requireAuth, async (req, res) => {
  const { clerkId, name, email, avatar } = req.body;
  console.log("Sync requested for:", { clerkId, email });

  try {
    // 1. Check if super_admin exists
    const superAdminExists = await User.findOne({ role: "super_admin" });

    // 2. Atomic Upsert (Avoid ConflictingUpdateOperators by separating fields)
    const setQuery = {};
    const setOnInsertQuery = {
      role: superAdminExists ? "user" : "super_admin"
    };

    if (name) {
      setQuery.name = name;
    } else {
      setOnInsertQuery.name = "Anonymous";
    }

    if (email) setQuery.email = email;
    if (avatar) setQuery.avatar = avatar;

    const user = await User.findOneAndUpdate(
      { clerkId },
      {
        $set: setQuery,
        $setOnInsert: setOnInsertQuery
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    console.log(`Sync complete for: ${clerkId}. Role: ${user.role}`);
    res.json(user);
  } catch (error) {
    console.error("DETAILED Error syncing user:", error);
    res.status(500).json({ message: "Error syncing user", error: error.message });
  }
});

/**
 * @swagger
 * /users/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Users]
 */
router.get("/stats", requireAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" }); // Count only regular users? Or active ones?
    // Let's count all non-admin users for now
    res.json({ totalUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
