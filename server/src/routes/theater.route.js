import express from "express";
import Theater from "../models/theater.js";
import User from "../models/user.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", requireAuth, async (req, res) => {
    const { name, location, description } = req.body;
    const clerkId = req.auth.userId;

    try {
        const user = await User.findOne({ clerkId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role !== "user") {
            return res.status(400).json({ message: "User already has an administrative role" });
        }

        const theater = await Theater.create({
            name,
            location,
            description,
            ownerId: user._id,
        });

        user.role = "admin";
        user.theaterId = theater._id;
        await user.save();

        res.status(201).json({ theater, user });
    } catch (error) {
        console.error("Error registering theater:", error);
        res.status(500).json({ message: "Error registering theater", error: error.message });
    }
});

// Get all theaters (for super_admin)
router.get("/", requireAuth, async (req, res) => {
    try {
        const clerkId = req.auth.userId;
        const user = await User.findOne({ clerkId });
        if (!user || user.role !== 'super_admin') {
            return res.status(403).json({ message: "Unauthorized" });
        }
        const theaters = await Theater.find().populate('ownerId', 'name email');
        res.json(theaters);
    } catch (error) {
        res.status(500).json({ message: "Error fetching theaters" });
    }
});

export default router;
