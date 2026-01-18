import express from "express";
import { isAdmin } from "../middleware/auth.middleware.js";
import * as movieController from "../controllers/movie.controller.js";

const router = express.Router();

/**
 * @swagger
 * /movies:
 *   post:
 *     summary: Create a new movie (Super Admin only)
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
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
 *               language:
 *                 type: string
 *               releaseDate:
 *                 type: string
 *                 format: date
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Movie created successfully
 *       403:
 *         description: Unauthorized
 */
router.post("/", isAdmin, movieController.createMovie);

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Get all movies
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: showingOnly
 *         schema:
 *           type: boolean
 *         description: Filter movies that have active shows
 *     responses:
 *       200:
 *         description: List of movies
 */
router.get("/", movieController.getMovies);

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
router.get("/:id", movieController.getMovieById);

/**
 * @swagger
 * /movies/{id}:
 *   put:
 *     summary: Update a movie (Super Admin only)
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *       200:
 *         description: Movie updated successfully
 *       404:
 *         description: Movie not found
 */
router.put("/:id", isAdmin, movieController.updateMovie);

/**
 * @swagger
 * /movies/{id}:
 *   delete:
 *     summary: Delete a movie (Super Admin only)
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie deleted successfully
 *       404:
 *         description: Movie not found
 */
router.delete("/:id", isAdmin, movieController.deleteMovie);

export default router;

