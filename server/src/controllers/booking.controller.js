import Booking from "../models/booking.js";
import Show from "../models/show.js";
import User from "../models/user.js";
import { getAuth } from "@clerk/express";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import crypto from "crypto";
import { getIO } from "../config/socket.js";

// Cashfree Configuration
let cashfreeInstance;
const getCashfree = () => {
    if (!cashfreeInstance) {
        cashfreeInstance = new Cashfree(
            process.env.CASHFREE_BASE_URL?.includes("sandbox")
                ? CFEnvironment.SANDBOX
                : CFEnvironment.PRODUCTION,
            process.env.CASHFREE_CLIENT_ID,
            process.env.CASHFREE_CLIENT_SECRET
        );
    }
    return cashfreeInstance;
};

export const createBooking = async (req, res) => {
    try {
        const { showId, seats, totalAmount } = req.body;
        const auth = getAuth(req);
        const userId = auth.userId;

        // Fetch user for email
        const user = await User.findOne({ clerkId: userId });
        if (!user) return res.status(404).json({ message: "User not found" });

        const show = await Show.findById(showId).populate("movie");
        if (!show) return res.status(404).json({ message: "Show not found" });

        const now = new Date();
        const showStartTime = new Date(`${show.date}T${show.time}:00`);
        if (now > showStartTime) {
            return res.status(400).json({ message: "Show has already started" });
        }

        // Generate unique order ID
        const orderId = `ORDER_${crypto.randomBytes(6).toString("hex")}`;

        // Create the booking with status: pending
        const booking = await Booking.create({
            userId,
            show: showId,
            seats,
            totalAmount,
            orderId,
            status: "pending"
        });

        // Re-fetch show to get latest seat statuses just before verification
        const freshShow = await Show.findById(showId);

        // Verify seats are still locked by user
        for (const seatId of seats) {
            const seat = freshShow.seats.find(s => s.seatId === seatId);

            if (!seat) {
                throw new Error(`Seat ${seatId} not found`);
            }

            if (seat.status === "BOOKED") {
                throw new Error(`Seat ${seatId} is already booked`);
            }

            if (seat.status !== "LOCKED" || seat.lockedBy !== userId) {
                throw new Error(`Seat ${seatId} is no longer locked for you. Please select it again.`);
            }
        }

        // Cashfree Order Request
        const request = {
            order_amount: totalAmount,
            order_currency: "INR",
            order_id: orderId,
            customer_details: {
                customer_id: userId,
                customer_phone: "9999999999", // Placeholder as we don't have user phone
                customer_email: user.email || "no-email@example.com"
            },
            order_meta: {
                // In integrated mode, return_url is used for redirection if needed
                return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/bookings?order_id={order_id}`
            },
            order_note: `Ticket booking for ${show.movie.title}`
        };

        const cashfree = getCashfree();
        const response = await cashfree.PGCreateOrder(request);

        // Update booking with Cashfree order ID
        booking.cfOrderId = response.data.cf_order_id;
        await booking.save();

        res.status(201).json({
            booking,
            payment_session_id: response.data.payment_session_id
        });
    } catch (error) {
        console.error("Payment initiation error:", error);
        res.status(400).json({ message: error.message });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { orderId } = req.body;

        const cashfree = getCashfree();

        // 1. Fetch Order Status (Overall)
        const orderResponse = await cashfree.PGFetchOrder(orderId);
        const orderData = orderResponse.data;

        const booking = await Booking.findOne({ orderId }).populate("show");
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        // Update technical status for debugging
        booking.paymentStatus = orderData.order_status;

        // 2. Fetch Payment Attempts (Detailed)
        const paymentsResponse = await cashfree.PGOrderFetchPayments(orderId);
        const payments = paymentsResponse.data;
        const successPayment = payments.find(p => p.payment_status === "SUCCESS");

        if (orderData.order_status === "PAID" || successPayment) {
            booking.status = "confirmed";
            await booking.save();

            // Atomic mark seats as BOOKED
            await Show.findOneAndUpdate(
                { _id: booking.show._id },
                {
                    $set: {
                        "seats.$[elem].status": "BOOKED",
                        "seats.$[elem].lockedBy": null,
                        "seats.$[elem].lockedAt": null
                    }
                },
                {
                    arrayFilters: [{ "elem.seatId": { $in: booking.seats } }],
                    new: true
                }
            );

            const bookedSeats = booking.seats.map(seatId => ({
                seatId,
                status: "BOOKED",
                lockedBy: null
            }));

            getIO().to(booking.show._id.toString()).emit("seats-updated", bookedSeats);

            return res.json({ status: "success", booking });
        } else if (["CANCELLED", "EXPIRED"].includes(orderData.order_status)) {
            booking.status = orderData.order_status === "CANCELLED" ? "cancelled" : "failed";
            await booking.save();

            // Unlock seats atomically
            await Show.findOneAndUpdate(
                { _id: booking.show._id },
                {
                    $set: {
                        "seats.$[elem].status": "AVAILABLE",
                        "seats.$[elem].lockedBy": null,
                        "seats.$[elem].lockedAt": null
                    }
                },
                {
                    arrayFilters: [
                        {
                            "elem.seatId": { $in: booking.seats },
                            "elem.lockedBy": booking.userId
                        }
                    ],
                    new: true
                }
            );

            return res.json({ status: booking.status, booking });
        }

        // If still pending or active, return pending
        res.json({ status: "pending", booking });
    } catch (error) {
        console.error("Payment verification error:", error);
        res.status(500).json({ message: error.message });
    }
};


export const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const auth = getAuth(req);
        const user = await User.findOne({ clerkId: auth.userId });

        const booking = await Booking.findById(id).populate("show");
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        // Security check: Only owner or admin/super_admin can delete
        const isOwner = booking.userId === auth.userId;
        const isAdmin = user && (user.role === "admin" || user.role === "super_admin");

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Unauthorized to delete this booking" });
        }

        // If booking is pending or confirmed, unlock the seats in the show
        if (booking.status === "pending" || booking.status === "confirmed") {
            const show = await Show.findById(booking.show._id);
            if (show) {
                show.seats.forEach(seat => {
                    if (booking.seats.includes(seat.seatId)) {
                        seat.status = "AVAILABLE";
                        seat.lockedBy = null;
                        seat.lockedAt = null;
                    }
                });
                await show.save();
            }
        }

        await Booking.findByIdAndDelete(id);
        res.json({ message: "Booking deleted and seats unlocked if applicable" });
    } catch (error) {
        console.error("Error deleting booking:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getUserBookings = async (req, res) => {
    try {
        const auth = getAuth(req);
        const userId = auth.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await Booking.countDocuments({ userId });
        const bookings = await Booking.find({ userId })
            .populate({
                path: "show",
                populate: {
                    path: "movie"
                }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            bookings,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalBookings: total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getTheaterBookings = async (req, res) => {
    try {
        const auth = getAuth(req);
        const user = await User.findOne({ clerkId: auth.userId });
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;

        if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        let query = {};
        if (user.role === "admin") {
            // We need to filter by theaterId in the show population
            // Alternatively, find shows first or use aggregation
            const theaterShows = await Show.find({ theater: user.theaterId }).distinct("_id");
            query.show = { $in: theaterShows };
        }

        const total = await Booking.countDocuments(query);
        const bookingsData = await Booking.find(query)
            .populate({
                path: "show",
                populate: [
                    { path: "movie" },
                    { path: "theater" }
                ]
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(); // Use lean for easier manual manipulation

        // Manually join User names
        const clerkIds = [...new Set(bookingsData.map(b => b.userId))];
        const localUsers = await User.find({ clerkId: { $in: clerkIds } });
        const userMap = localUsers.reduce((acc, u) => {
            acc[u.clerkId] = u.name || "Unknown User";
            return acc;
        }, {});

        const bookings = bookingsData.map(b => ({
            ...b,
            userName: userMap[b.userId] || "Unknown User"
        }));

        res.json({
            bookings,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalBookings: total
        });
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
