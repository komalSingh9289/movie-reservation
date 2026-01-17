import express from "express";
import { getAuth } from "@clerk/express";
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
 * /users/favorites/{movieId}:
 *   post:
 *     summary: Toggle movie in user's favorites
 *     tags: [Users]
 */
router.post("/favorites/:movieId", requireAuth, async (req, res) => {
  try {
    const auth = getAuth(req);
    const user = await User.findOne({ clerkId: auth.userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const movieId = req.params.movieId;
    const isFavorite = user.favorites.includes(movieId);

    if (isFavorite) {
      user.favorites = user.favorites.filter(id => id.toString() !== movieId);
    } else {
      user.favorites.push(movieId);
    }

    await user.save();
    res.json({ message: isFavorite ? "Removed from favorites" : "Added to favorites", favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /users/favorites:
 *   get:
 *     summary: Get user's favorite movies
 *     tags: [Users]
 */
router.get("/favorites", requireAuth, async (req, res) => {
  try {
    const auth = getAuth(req);
    const user = await User.findOne({ clerkId: auth.userId }).populate("favorites");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
