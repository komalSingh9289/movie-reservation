import Show from "../models/show.js";
import { generateSeats } from "../utils/generateSeats.js";
import Theater from "../models/theater.js";
import OrganizationMovie from "../models/organizationMovie.js";
import Organization from "../models/organization.js";
import SeatLayout from "../models/seatLayout.js";

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
        const shows = await Show.find({
            movie: req.params.movieId
        })
            .populate("movie")
            .populate("theater")
            .sort({ date: 1, time: 1 });

        res.json(shows);
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
        const shows = await Show.find(query)
            .populate("movie")
            .sort({ date: 1, time: 1 });

        res.json(shows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUpcomingShows = async (req, res) => {
    try {
        const shows = await Show.find()
            .populate("movie")
            .populate("theater")
            .sort({ date: 1, time: 1 })
            .limit(5);

        res.json(shows);
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
