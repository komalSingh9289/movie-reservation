import express from "express";
import Movie from "../models/movies.js";
import { isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /movies:
 *   post:
 *     summary: Create a new movie
 *     tags: [Movies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - poster
 *               - duration
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               poster:
 *                 type: string
 *               duration:
 *                 type: string
 *     responses:
 *       201:
 *         description: Movie created successfully
 */
router.post("/", isAdmin, async (req, res) => {
  try {
    const movieData = { ...req.body };

    // Automatically scope to theater if theater_admin
    if (req.dbUser.role === "admin") {
      movieData.theaterId = req.dbUser.theaterId;
    } else if (req.dbUser.role === "super_admin" && !movieData.theaterId) {
      return res.status(400).json({ message: "Super Admin must provide theaterId" });
    }

    const movie = await Movie.create(movieData);
    res.status(201).json(movie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Get all movies
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: List of movies
 */
router.get("/", async (req, res) => {
  const { theaterId } = req.query;
  try {
    const query = { isActive: true };
    if (theaterId) query.theaterId = theaterId;

    const movies = await Movie.find(query);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /movies/{id}:
 *   get:
 *     summary: Get movie by ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie found
 *       404:
 *         description: Movie not found
 */
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.json(movie);
  } catch (error) {
    res.status(400).json({ message: "Invalid movie ID" });
  }
});

export default router;
