import express from "express";
import Booking from "../models/booking.js";
import Show from "../models/show.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getAuth } from "@clerk/express";

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

export default router;
