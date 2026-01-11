import { getAuth } from "@clerk/express";
import User from "../models/user.js";

export const requireAuth = (req, res, next) => {
    const auth = getAuth(req);
    if (!auth.userId) {
        console.warn("Unauthenticated request blocked:", {
            path: req.path,
            hasToken: !!req.headers.authorization
        });
        return res.status(401).json({ message: "Unauthenticated" });
    }
    next();
};

export const isAdmin = async (req, res, next) => {
    const auth = getAuth(req);
    if (!auth.userId) {
        return res.status(401).json({ message: "Unauthenticated" });
    }

    try {
        const user = await User.findOne({ clerkId: auth.userId });
        if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
            return res.status(403).json({ message: "Unauthorized: Admin access required" });
        }
        req.dbUser = user;
        next();
    } catch (error) {
        console.error("Error checking admin role:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const isSuperAdmin = async (req, res, next) => {
    const auth = getAuth(req);
    if (!auth.userId) {
        return res.status(401).json({ message: "Unauthenticated" });
    }

    try {
        const user = await User.findOne({ clerkId: auth.userId });
        if (!user || user.role !== "super_admin") {
            return res.status(403).json({ message: "Unauthorized: Super Admin access required" });
        }
        req.dbUser = user;
        next();
    } catch (error) {
        console.error("Error checking super admin role:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
