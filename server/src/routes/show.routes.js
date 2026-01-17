import express from "express";
import Show from "../models/show.js";
import { generateSeats } from "../utils/generateSeats.js";
import { isAdmin } from "../middleware/auth.middleware.js";
import Theater from "../models/theater.js";
import OrganizationMovie from "../models/organizationMovie.js";

const router = express.Router();

/**
 * @swagger
 * /shows:
 *   post:
 *     summary: Create a show for a movie
 *     tags: [Shows]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movie
 *               - date
 *               - time
 *               - price
 *             properties:
 *               movie:
 *                 type: string
 *               date:
 *                 type: string
 *               time:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Show created successfully
 */
router.post("/", isAdmin, async (req, res) => {
  try {
    const { movie, date, time, price, theaterId, screenId } = req.body;

    let finalTheaterId = theaterId;
    let organizationId = req.dbUser.organizationId;

    if (req.dbUser.role === "admin") {
      finalTheaterId = req.dbUser.theaterId;

      // Fallback: If user doesn't have theaterId/orgId populated, find their organization
      if (!finalTheaterId || !organizationId) {
        const org = await import("../models/organization.js").then(m => m.default.findOne({ adminId: req.dbUser._id }));
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
      // For super_admin, we might need to fetch the theater to get its orgId
      const theater = await Theater.findById(theaterId);
      if (!theater) return res.status(404).json({ message: "Theater not found" });
      organizationId = theater.organizationId;
    }

    if (!screenId) {
      return res.status(400).json({ message: "screenId is required" });
    }

    // NEW: Validate if movie is in organization's collection
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

    // Get screen capacity for seat generation
    const theater = await Theater.findById(finalTheaterId);
    const screen = theater.screens.id(screenId);
    if (!screen) return res.status(404).json({ message: "Screen not found in this theater" });

    const show = await Show.create({
      movie,
      date,
      time,
      price,
      theater: finalTheaterId,
      screenId,
      organization: organizationId,
      seats: generateSeats(screen.capacity),
    });

    res.status(201).json(show);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /shows/movie/{movieId}:
 *   get:
 *     summary: Get shows by movie ID
 *     tags: [Shows]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of shows
 */
router.get("/movie/:movieId", async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const shows = await Show.find({
      movie: req.params.movieId,
      date: { $gte: today }
    })
      .populate("movie")
      .populate("theater")
      .sort({ date: 1, time: 1 });

    res.json(shows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /shows/me:
 *   get:
 *     summary: Get shows for current admin's theater
 *     tags: [Shows]
 */
router.get("/me", isAdmin, async (req, res) => {
  try {
    let theaterId = req.dbUser.theaterId;

    if (!theaterId) {
      const org = await import("../models/organization.js").then(m => m.default.findOne({ adminId: req.dbUser._id }));
      if (org) {
        theaterId = org.theaterId;
      }
    }

    if (!theaterId) {
      return res.status(404).json({ message: "Theater not found" });
    }

    // Query using 'theater' field as defined in schema
    const query = { theater: theaterId };
    const shows = await Show.find(query)
      .populate("movie")
      .sort({ date: 1, time: 1 });

    res.json(shows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /shows/upcoming:
 *   get:
 *     summary: Get upcoming shows sorted by date and time
 *     tags: [Shows]
 */
router.get("/upcoming", async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const shows = await Show.find({ date: { $gte: today } })
      .populate("movie")
      .populate("theater") // Populate theater to show name
      .sort({ date: 1, time: 1 })
      .limit(5);

    res.json(shows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
