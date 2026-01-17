import { getAuth } from "@clerk/express";
import User from "../models/user.js";

export const requireAuth = (req, res, next) => {
    const auth = getAuth(req);
    if (!auth.userId) {
        console.warn("[AUTH ERROR] Unauthenticated request blocked:", {
            path: req.baseUrl + req.path,
            hasHeader: !!req.headers.authorization,
            authStatus: auth.status, // log clerk auth status
            reason: auth.reason,   // log clerk auth reason if available
            claims: auth.claims ? "Present" : "None"
        });
        return res.status(401).json({
            message: "Unauthenticated",
            error: auth.reason || "Missing session"
        });
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
