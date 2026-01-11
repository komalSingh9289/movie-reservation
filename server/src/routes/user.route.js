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
    let user = await User.findOne({ clerkId });

    if (!user) {
      // Check if this is the first user overall
      const userCount = await User.countDocuments();
      const role = userCount === 0 ? "super_admin" : "user";
      console.log(`Creating NEW user with role: ${role}`);

      user = await User.create({
        clerkId,
        name,
        email,
        avatar,
        role,
      });
    } else {
      // Healing logic: If this user exists but there's no super_admin in the system yet,
      // and they are the first user (or one of the users), assign them super_admin.
      const superAdminExists = await User.findOne({ role: "super_admin" });
      if (!superAdminExists) {
        console.log("No super_admin found in system, promoting current user to super_admin");
        user.role = "super_admin";
      }

      // Update existing user details if they've changed
      user.name = name || user.name;
      user.email = email || user.email;
      user.avatar = avatar || user.avatar;
      await user.save();
    }

    res.json(user);
  } catch (error) {
    console.error("DETAILED Error syncing user:", error);
    res.status(500).json({ message: "Error syncing user", error: error.message });
  }
});

export default router;
