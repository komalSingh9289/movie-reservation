import express from "express";
import Booking from "../models/booking.js";
import Show from "../models/show.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getAuth } from "@clerk/express";
import User from "../models/user.js";

const router = express.Router();

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 */
router.post("/", requireAuth, async (req, res) => {
    try {
        const { showId, seats, totalAmount } = req.body;
        const auth = getAuth(req);
        const userId = auth.userId;

        // Create the booking
        const booking = await Booking.create({
            userId,
            show: showId,
            seats,
            totalAmount,
        });

        // Update show seats (mark as booked)
        const show = await Show.findById(showId);
        if (show) {
            show.seats.forEach(seat => {
                if (seats.includes(seat.id)) {
                    seat.isBooked = true;
                    seat.bookedBy = userId;
                }
            });
            await show.save();
        }

        res.status(201).json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /bookings/user:
 *   get:
 *     summary: Get user-specific bookings
 *     tags: [Bookings]
 */
router.get("/user", requireAuth, async (req, res) => {
    try {
        const auth = getAuth(req);
        const userId = auth.userId;

        const bookings = await Booking.find({ userId })
            .populate({
                path: "show",
                populate: {
                    path: "movie"
                }
            })
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /bookings/theater:
 *   get:
 *     summary: Get theater-specific bookings (for admins)
 *     tags: [Bookings]
 */
router.get("/theater", requireAuth, async (req, res) => {
    try {
        const auth = getAuth(req);
        const user = await User.findOne({ clerkId: auth.userId });

        if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        let query = {};
        if (user.role === "admin") {
            query.theaterId = user.theaterId;
        }

        // We need to populate show to filter by theater if theaterId is in Show
        // But let's check Booking model... usually it links to Show.
        // If Booking doesn't have theaterId, we must filter via Show.

        const bookings = await Booking.find()
            .populate({
                path: "show",
                match: user.role === "admin" ? { theaterId: user.theaterId } : {},
                populate: { path: "movie" }
            })
            .sort({ createdAt: -1 });

        // Filter out bookings where show didn't match the theaterId (if admin)
        const filteredBookings = bookings.filter(b => b.show !== null);

        res.json(filteredBookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /bookings/stats:
 *   get:
 *     summary: Get booking statistics (Revenue & Tickets Sold)
 *     tags: [Bookings]
 */
router.get("/stats", requireAuth, async (req, res) => {
    try {
        const auth = getAuth(req);
        const user = await User.findOne({ clerkId: auth.userId });

        if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        let matchStage = {};

        // If theater admin, filter by theater
        if (user.role === "admin") {
            // Need to find shows for this theater first, or aggregate with lookup
            // Since Booking -> Show -> Theater, we need a lookup
            matchStage = {}; // We'll handle filtering in the aggregate pipeline
        }

        const pipeline = [
            {
                $lookup: {
                    from: "shows",
                    localField: "show",
                    foreignField: "_id",
                    as: "showDetails"
                }
            },
            { $unwind: "$showDetails" }
        ];

        if (user.role === "admin") {
            pipeline.push({
                $match: {
                    "showDetails.theaterId": user.theaterId
                }
            });
        }

        pipeline.push({
            $group: {
                _id: null,
                totalRevenue: { $sum: "$totalAmount" },
                ticketsSold: { $sum: { $size: "$seats" } }
            }
        });

        const stats = await Booking.aggregate(pipeline);

        res.json(stats[0] || { totalRevenue: 0, ticketsSold: 0 });
    } catch (error) {
        console.error("Error fetching booking stats:", error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
