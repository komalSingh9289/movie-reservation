import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import * as userController from "../controllers/user.controller.js";

const router = express.Router();

/**
 * @swagger
 * /users/sync:
 *   post:
 *     summary: Sync Clerk user with DB
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clerkId:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: User synced successfully
 */
router.post("/sync", requireAuth, userController.syncUser);

/**
 * @swagger
 * /users/favorites/{movieId}:
 *   post:
 *     summary: Toggle movie in user's favorites
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Favorite toggled successfully
 */
router.post("/favorites/:movieId", requireAuth, userController.toggleFavorite);

/**
 * @swagger
 * /users/favorites:
 *   get:
 *     summary: Get user's favorite movies
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of favorite movies
 */
router.get("/favorites", requireAuth, userController.getFavorites);

/**
 * @swagger
 * /users/stats:
 *   get:
 *     summary: Get user statistics (Total users count)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User statistics
 */
router.get("/stats", requireAuth, userController.getUserStats);

export default router;
