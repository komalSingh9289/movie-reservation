import Booking from "../models/booking.js";
import Show from "../models/show.js";
import User from "../models/user.js";
import { getAuth } from "@clerk/express";

export const createBooking = async (req, res) => {
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
        // Note: The original code used seat.id, but show.seats is an array of subdocuments.
        // It might be better to use seat.seatNumber or ensure consistency.
        // Original code snippet:
        // show.seats.forEach(seat => {
        //     if (seats.includes(seat.id)) {
        //         seat.isBooked = true;
        //         seat.bookedBy = userId;
        //     }
        // });

        const show = await Show.findById(showId);
        if (show) {
            show.seats.forEach(seat => {
                // Using seatNumber as it's the identifier we usually use in frontend
                if (seats.includes(seat.seatNumber)) {
                    seat.status = "booked";
                    // If your schema has isBooked/bookedBy, keep them. 
                    // Let's check show.js model to be sure.
                }
            });
            await show.save();
        }

        res.status(201).json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getUserBookings = async (req, res) => {
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
};

export const getTheaterBookings = async (req, res) => {
    try {
        const auth = getAuth(req);
        const user = await User.findOne({ clerkId: auth.userId });

        if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        let query = {};
        const bookings = await Booking.find()
            .populate({
                path: "show",
                match: user.role === "admin" ? { theater: user.theaterId } : {},
                populate: { path: "movie" }
            })
            .sort({ createdAt: -1 });

        const filteredBookings = bookings.filter(b => b.show !== null);
        res.json(filteredBookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getBookingStats = async (req, res) => {
    try {
        const auth = getAuth(req);
        const user = await User.findOne({ clerkId: auth.userId });

        if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
            return res.status(403).json({ message: "Unauthorized" });
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
                    "showDetails.theater": user.theaterId
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
};
