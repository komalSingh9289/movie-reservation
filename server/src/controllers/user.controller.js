import User from "../models/user.js";
import { getAuth } from "@clerk/express";

export const syncUser = async (req, res) => {
    const { clerkId, name, email, avatar } = req.body;
    console.log("Sync requested for:", { clerkId, email });

    try {
        const superAdminExists = await User.findOne({ role: "super_admin" });

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
};

export const toggleFavorite = async (req, res) => {
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
};

export const getFavorites = async (req, res) => {
    try {
        const auth = getAuth(req);
        const user = await User.findOne({ clerkId: auth.userId }).populate("favorites");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user.favorites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: "user" });
        res.json({ totalUsers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
