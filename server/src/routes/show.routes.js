import express from "express";
import Show from "../models/show.js";
import { generateSeats } from "../utils/generateSeats.js";
import { isAdmin } from "../middleware/auth.middleware.js";

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
    const { movie, date, time, price, theaterId } = req.body;

    let finalTheaterId = theaterId;
    if (req.dbUser.role === "admin") {
      finalTheaterId = req.dbUser.theaterId;
    } else if (req.dbUser.role === "super_admin" && !theaterId) {
      return res.status(400).json({ message: "Super Admin must provide theaterId" });
    }

    const show = await Show.create({
      movie,
      date,
      time,
      price,
      theaterId: finalTheaterId,
      seats: generateSeats(),
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
    const shows = await Show.find({ movie: req.params.movieId })
      .populate("movie");

    res.json(shows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
