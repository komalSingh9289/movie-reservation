import express from "express";
import Organization from "../models/organization.js";
import Theater from "../models/theater.js";
import Movie from "../models/movies.js";
import Show from "../models/show.js";
import Booking from "../models/booking.js";
import { isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get comprehensive dashboard stats for super admin
 *     tags: [Admin]
 */
router.get("/stats", isAdmin, async (req, res) => {
    try {
        if (req.dbUser.role === "super_admin") {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            const endOfDay = new Date(today.setHours(23, 59, 59, 999));
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

            const todayDateString = startOfDay.toISOString().split('T')[0];
            const yesterdayDateString = yesterday.toISOString().split('T')[0];

            // 1. Total Organizations
            const totalOrganizations = await Organization.countDocuments();
            const orgsThisMonth = await Organization.countDocuments({ createdAt: { $gte: startOfMonth } });

            // 2. Total Theaters
            const totalTheaters = await Theater.countDocuments();
            const theatersThisMonth = await Theater.countDocuments({ createdAt: { $gte: startOfMonth } });

            // 4. Total Movies
            const totalMovies = await Movie.countDocuments();
            const moviesThisMonth = await Movie.countDocuments({ createdAt: { $gte: startOfMonth } });

            // 5. Active Shows Today
            const activeShowsToday = await Show.countDocuments({ date: todayDateString });
            const activeShowsYesterday = await Show.countDocuments({ date: yesterdayDateString });

            const showsTrend = activeShowsToday - activeShowsYesterday;
            const showsTrendStr = showsTrend >= 0 ? `+${showsTrend} vs yesterday` : `${showsTrend} vs yesterday`;

            // 6. Total Bookings (Today / This Month)
            const totalBookings = await Booking.countDocuments();

            const bookingsThisMonth = await Booking.countDocuments({
                createdAt: { $gte: startOfMonth }
            });

            const bookingsToday = await Booking.countDocuments({
                createdAt: { $gte: startOfDay, $lte: endOfDay }
            });

            return res.json({
                organizations: { total: totalOrganizations, trend: `+${orgsThisMonth} this month` },
                theaters: { total: totalTheaters, trend: `+${theatersThisMonth} this month` },
                movies: { total: totalMovies, trend: `+${moviesThisMonth} this month` },
                activeShows: { total: activeShowsToday, trend: showsTrendStr },
                bookings: { total: totalBookings, today: bookingsToday, month: bookingsThisMonth }
            });
        }

        // ORG ADMIN LOGIC
        if (req.dbUser.role === "admin") {
            let organizationId = req.dbUser.organizationId;
            // Fallback lookup if missing
            if (!organizationId) {
                const org = await Organization.findOne({ adminId: req.dbUser._id });
                if (org) organizationId = org._id;
            }

            if (!organizationId) {
                return res.status(404).json({ message: "Organization not found for this admin." });
            }

            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

            const todayDateString = today.toISOString().split('T')[0];

            // 1. Monthly Revenue
            const revenueAgg = await Booking.aggregate([
                {
                    $lookup: {
                        from: "shows",
                        localField: "show",
                        foreignField: "_id",
                        as: "showDetails"
                    }
                },
                { $unwind: "$showDetails" },
                { $match: { "showDetails.organization": organizationId } },
                {
                    $facet: {
                        thisMonth: [
                            { $match: { createdAt: { $gte: startOfMonth } } },
                            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
                        ],
                        lastMonth: [
                            { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
                            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
                        ],
                        totalBookings: [
                            { $count: "count" }
                        ],
                        bookingsToday: [
                            { $match: { createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } } },
                            { $count: "count" }
                        ]

                    }
                }
            ]);

            const revenueThisMonth = revenueAgg[0].thisMonth[0]?.total || 0;
            const revenueLastMonth = revenueAgg[0].lastMonth[0]?.total || 0;

            const revenueTrend = revenueLastMonth === 0 ? 100 : ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100;
            const revenueTrendStr = `${revenueTrend > 0 ? '+' : ''}${revenueTrend.toFixed(1)}% vs last month`;

            // 2. My Movies Catalog (Dynamic import)
            const totalMovies = await import("../models/organizationMovie.js").then(m => m.default.countDocuments({ organizationId, isActive: true }));

            // 3. Active Shows
            const activeShowsToday = await Show.countDocuments({ organization: organizationId, date: todayDateString });

            // 4. Total Bookings
            const totalBookings = revenueAgg[0].totalBookings[0]?.count || 0;
            const bookingsToday = revenueAgg[0].bookingsToday[0]?.count || 0;


            return res.json({
                revenue: { total: revenueThisMonth, trend: revenueTrendStr },
                movies: { total: totalMovies, trend: "In Catalog" },
                bookings: { total: totalBookings, trend: `+${bookingsToday} today` },
                activeShows: { total: activeShowsToday, trend: "Showing today" }
            });
        }

        return res.status(403).json({ message: "Access denied" });

    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
