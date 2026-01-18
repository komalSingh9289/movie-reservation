import express from "express";
import { isAdmin, requireAuth } from "../middleware/auth.middleware.js";
import * as organizationMovieController from "../controllers/organizationMovie.controller.js";

const router = express.Router();

/**
 * @swagger
 * /organization-movies:
 *   post:
 *     summary: Add movie to organization collection
 *     tags: [OrganizationMovies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movieId
 *             properties:
 *               movieId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Movie added successfully
 */
router.post("/", isAdmin, organizationMovieController.addMovieToOrganization);

/**
 * @swagger
 * /organization-movies:
 *   get:
 *     summary: Get organization movie collection
 *     tags: [OrganizationMovies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         schema:
 *           type: string
 *         description: Organization ID (for Super Admin)
 *     responses:
 *       200:
 *         description: List of movies in organization collection
 */
router.get("/", requireAuth, organizationMovieController.getOrganizationMovies);

export default router;
