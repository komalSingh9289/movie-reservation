import express from "express";
import { isAdmin } from "../middleware/auth.middleware.js";
import * as showController from "../controllers/show.controller.js";

const router = express.Router();

/**
 * @swagger
 * /shows:
 *   post:
 *     summary: Create a show for a movie
 *     tags: [Shows]
 *     security:
 *       - bearerAuth: []
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
 *               - screenId
 *             properties:
 *               movie:
 *                 type: string
 *               date:
 *                 type: string
 *               time:
 *                 type: string
 *               price:
 *                 type: number
 *               theaterId:
 *                 type: string
 *               screenId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Show created successfully
 */
router.post("/", isAdmin, showController.createShow);

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
router.get("/movie/:movieId", showController.getShowsByMovie);

/**
 * @swagger
 * /shows/me:
 *   get:
 *     summary: Get shows for current admin's theater
 *     tags: [Shows]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of shows for admin
 */
router.get("/me", isAdmin, showController.getAdminShows);

/**
 * @swagger
 * /shows/upcoming:
 *   get:
 *     summary: Get upcoming shows
 *     tags: [Shows]
 *     responses:
 *       200:
 *         description: List of upcoming shows
 */
router.get("/upcoming", showController.getUpcomingShows);

/**
 * @swagger
 * /shows/{id}:
 *   get:
 *     summary: Get show by ID
 *     tags: [Shows]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Show found
 *       404:
 *         description: Show not found
 */
router.get("/:id", showController.getShowById);

/**
 * @swagger
 * /shows/{id}:
 *   delete:
 *     summary: Delete a show
 *     tags: [Shows]
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
 *         description: Show deleted successfully
 *       404:
 *         description: Show not found
 */
router.delete("/:id", isAdmin, showController.deleteShow);

/**
 * @swagger
 * /shows/{id}/lock-seats:
 *   patch:
 *     summary: Lock seats for a show
 *     tags: [Shows]
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
 *             required:
 *               - seats
 *             properties:
 *               seats:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Seats locked successfully
 */
router.patch("/:id/lock-seats", showController.lockSeats);

/**
 * @swagger
 * /shows/{id}/unlock-seats:
 *   patch:
 *     summary: Unlock seats for a show
 *     tags: [Shows]
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
 *             required:
 *               - seats
 *             properties:
 *               seats:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Seats unlocked successfully
 */
router.patch("/:id/unlock-seats", showController.unlockSeats);

export default router;
