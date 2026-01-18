import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import * as theaterController from "../controllers/theater.controller.js";

const router = express.Router();

/**
 * @swagger
 * /theaters/register:
 *   post:
 *     summary: Register a new theater and organization
 *     tags: [Theaters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location
 *               - organizationName
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *               organizationName:
 *                 type: string
 *               organizationDescription:
 *                 type: string
 *               screens:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     capacity:
 *                       type: number
 *                     layoutId:
 *                       type: object
 *     responses:
 *       201:
 *         description: Theater and Organization registered successfully
 *       400:
 *         description: Invalid input or role
 */
router.post("/register", requireAuth, theaterController.registerTheater);

/**
 * @swagger
 * /theaters:
 *   get:
 *     summary: Get all theaters (Super Admin only)
 *     tags: [Theaters]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all theaters
 *       403:
 *         description: Unauthorized
 */
router.get("/", requireAuth, theaterController.getAllTheaters);

/**
 * @swagger
 * /theaters/me:
 *   get:
 *     summary: Get current user's theater and organization
 *     tags: [Theaters]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Theater and Organization found
 *       404:
 *         description: Theater not found
 */
router.get("/me", requireAuth, theaterController.getMe);

/**
 * @swagger
 * /theaters/me:
 *   put:
 *     summary: Update current user's theater and organization
 *     tags: [Theaters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *               organizationName:
 *                 type: string
 *               organizationDescription:
 *                 type: string
 *               screens:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Details updated successfully
 *       404:
 *         description: Theater not found
 */
router.put("/me", requireAuth, theaterController.updateMe);

export default router;

