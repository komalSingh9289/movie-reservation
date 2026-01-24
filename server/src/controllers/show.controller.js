import Show from "../models/show.js";
import { generateSeats } from "../utils/generateSeats.js";
import Theater from "../models/theater.js";
import OrganizationMovie from "../models/organizationMovie.js";
import Organization from "../models/organization.js";
import SeatLayout from "../models/seatLayout.js";
import { getAuth } from "@clerk/express";
import { getIO } from "../config/socket.js";

export const createShow = async (req, res) => {
    try {
        const { movie, date, time, price, theaterId, screenId } = req.body;

        let finalTheaterId = theaterId;
        let organizationId = req.dbUser.organizationId;

        if (req.dbUser.role === "admin") {
            finalTheaterId = req.dbUser.theaterId;

            if (!finalTheaterId || !organizationId) {
                const org = await Organization.findOne({ adminId: req.dbUser._id });
                if (org) {
                    finalTheaterId = org.theaterId;
                    organizationId = org._id;
                }
            }

            if (!finalTheaterId) {
                return res.status(400).json({ message: "No theater associated with this admin account." });
            }

        } else if (req.dbUser.role === "super_admin") {
            if (!theaterId) {
                return res.status(400).json({ message: "Super Admin must provide theaterId" });
            }
            const theater = await Theater.findById(theaterId);
            if (!theater) return res.status(404).json({ message: "Theater not found" });
            organizationId = theater.organizationId;
        }

        if (!screenId) {
            return res.status(400).json({ message: "screenId is required" });
        }

        const theaterDoc = await Theater.findById(finalTheaterId);
        if (!theaterDoc) return res.status(404).json({ message: "Theater not found" });

        const screen = theaterDoc.screens.id(screenId);
        if (!screen) return res.status(404).json({ message: "Screen not found in this theater" });

        const layout = await SeatLayout.findById(screen.layoutId);
        if (!layout) {
            return res.status(400).json({ message: "Seat layout not found" });
        }

        const isMovieEnabled = await OrganizationMovie.findOne({
            organizationId,
            movieId: movie,
            isActive: true
        });

        if (!isMovieEnabled) {
            return res.status(403).json({
                message: "Movie must be added to your organization's library before scheduling shows."
            });
        }
        // console.log("Seat types map:", layout.seatTypes);
        // console.log("Row A type:", layout.seatTypes.get("A"));

        const show = await Show.create({
            movie,
            date,
            time,
            price,
            theater: finalTheaterId,
            screenId,
            organization: organizationId,
            seats: generateSeats(layout),
        });

        res.status(201).json(show);
    } catch (error) {
        console.error("Create show error:", error);
        res.status(400).json({ message: error.message });
    }
};

export const getShowsByMovie = async (req, res) => {
    try {
        const now = new Date();
        const shows = await Show.find({
            movie: req.params.movieId,
            // Get shows from today (UTC date) onwards to ensure we don't miss any due to timezone offsets
            date: { $gte: now.toISOString().split('T')[0] }
        })
            .populate("movie")
            .populate("theater")
            .sort({ date: 1, time: 1 });

        // Filter out shows that are in the past
        const filteredShows = shows.filter(show => {
            // Robust parsing: "2026-01-23" or "2026-1-23" and "18:00" or "9:00"
            const [year, month, day] = show.date.split('-').map(Number);
            const [hours, minutes] = show.time.split(':').map(Number);

            // Create date in local time
            const showStartTime = new Date(year, month - 1, day, hours, minutes);

            return showStartTime > now;
        });

        res.json(filteredShows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getShowById = async (req, res) => {
    try {
        const show = await Show.findById(req.params.id)
            .populate("movie")
            .populate("theater");
        if (!show) {
            return res.status(404).json({ message: "Show not found" });
        }
        res.json(show);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAdminShows = async (req, res) => {
    try {
        let theaterId = req.dbUser.theaterId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if (!theaterId) {
            const org = await Organization.findOne({ adminId: req.dbUser._id });
            if (org) {
                theaterId = org.theaterId;
            }
        }

        if (!theaterId) {
            return res.status(404).json({ message: "Theater not found" });
        }

        const query = { theater: theaterId };

        const total = await Show.countDocuments(query);
        const shows = await Show.find(query)
            .populate("movie")
            .sort({ date: 1, time: 1 })
            .skip(skip)
            .limit(limit);

        res.json({
            shows,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalShows: total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateShow = async (req, res) => {
    try {
        const { date, time, price } = req.body;
        const show = await Show.findById(req.params.id);

        if (!show) return res.status(404).json({ message: "Show not found" });

        const now = new Date();
        const showStartTime = new Date(`${show.date}T${show.time}:00`);
        if (now > showStartTime) {
            return res.status(400).json({ message: "Cannot edit an expired/started show" });
        }

        const updatedShow = await Show.findByIdAndUpdate(
            req.params.id,
            { date, time, price },
            { new: true }
        ).populate("movie");

        res.json(updatedShow);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const cancelShow = async (req, res) => {
    try {
        const show = await Show.findById(req.params.id);
        if (!show) return res.status(404).json({ message: "Show not found" });

        const now = new Date();
        const showStartTime = new Date(`${show.date}T${show.time}:00`);
        if (now > showStartTime) {
            return res.status(400).json({ message: "Cannot cancel an expired/started show" });
        }

        show.status = "CANCELLED";
        await show.save();
        res.json({ message: "Show cancelled successfully", show });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const archiveShow = async (req, res) => {
    try {
        const show = await Show.findById(req.params.id);
        if (!show) return res.status(404).json({ message: "Show not found" });

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        if (show.date > todayStr) {
            return res.status(400).json({ message: "Cannot archive a future show" });
        }

        show.status = "ARCHIVED";
        await show.save();
        res.json({ message: "Show archived successfully", show });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUpcomingShows = async (req, res) => {
    try {
        const now = new Date();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = {
            date: { $gte: now.toISOString().split('T')[0] },
            status: "ACTIVE"
        };

        const shows = await Show.find(query)
            .populate("movie")
            .populate("theater")
            .sort({ date: 1, time: 1 });

        // Filter out shows that are in the past
        const filteredShows = shows.filter(show => {
            const [year, month, day] = show.date.split('-').map(Number);
            const [hours, minutes] = show.time.split(':').map(Number);
            const showStartTime = new Date(year, month - 1, day, hours, minutes);

            return showStartTime > now;
        });

        const total = filteredShows.length;
        const pagedShows = filteredShows.slice(skip, skip + limit);

        res.json({
            shows: pagedShows,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalShows: total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteShow = async (req, res) => {
    try {
        const query = { _id: req.params.id };

        // Secure deletion: Only allow organization admins to delete their own shows
        if (req.dbUser.role === "admin") {
            let organizationId = req.dbUser.organizationId;
            if (!organizationId) {
                const org = await Organization.findOne({ adminId: req.dbUser._id });
                if (org) organizationId = org._id;
            }
            query.organization = organizationId;
        }

        const show = await Show.findOneAndDelete(query);
        if (!show) {
            return res.status(404).json({ message: "Show not found or unauthorized" });
        }
        res.json(show);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const lockSeats = async (req, res) => {
    try {
        const { seats } = req.body;
        const { id: showId } = req.params;
        const auth = getAuth(req);
        const userId = auth.userId;

        const show = await Show.findById(showId);
        if (!show) return res.status(404).json({ message: "Show not found" });

        const now = new Date();
        const showStartTime = new Date(`${show.date}T${show.time}:00`);

        if (now > showStartTime) {
            return res.status(400).json({ message: "Show has already started" });
        }

        const lockExpiryTime = 5 * 60 * 1000;

        // 🔍 Validate seats
        for (const seatId of seats) {
            const seat = show.seats.find(s => s.seatId === seatId);

            if (!seat) {
                return res.status(400).json({ message: `Seat ${seatId} not found` });
            }

            if (seat.status === "BOOKED") {
                return res.status(400).json({ message: `Seat ${seatId} is already booked` });
            }

            if (seat.status === "LOCKED") {
                const isExpired = now - new Date(seat.lockedAt) > lockExpiryTime;
                if (!isExpired && seat.lockedBy !== userId) {
                    return res.status(400).json({
                        message: `Seat ${seatId} is locked by another user`
                    });
                }
            }
        }

        // 🔒 Atomic lock
        const updatedShow = await Show.findOneAndUpdate(
            { _id: showId },
            {
                $set: {
                    "seats.$[elem].status": "LOCKED",
                    "seats.$[elem].lockedBy": userId,
                    "seats.$[elem].lockedAt": now
                }
            },
            {
                arrayFilters: [{ "elem.seatId": { $in: seats } }],
                new: true
            }
        );




        // 📡 Emit real-time update
        const lockedSeats = seats.map(seatId => ({
            seatId,
            status: "LOCKED",
            lockedBy: userId
        }));

        getIO().to(showId).emit("seats-updated", lockedSeats);

        res.json({
            message: "Seats locked successfully",
            show: updatedShow
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const unlockSeats = async (req, res) => {
    try {
        const { seats } = req.body;
        const { id: showId } = req.params;
        const auth = getAuth(req);
        const userId = auth.userId;

        const updatedShow = await Show.findOneAndUpdate(
            { _id: showId },
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
                        "elem.seatId": { $in: seats },
                        "elem.lockedBy": userId
                    }
                ],
                new: true
            }
        );

        if (!updatedShow) {
            return res.status(404).json({ message: "Show not found" });
        }

        // 📡 Emit real-time unlock
        const unlockedSeats = seats.map(seatId => ({
            seatId,
            status: "AVAILABLE",
            lockedBy: null
        }));

        getIO().to(showId).emit("seats-updated", unlockedSeats);

        res.json({
            message: "Seats unlocked successfully",
            show: updatedShow
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

