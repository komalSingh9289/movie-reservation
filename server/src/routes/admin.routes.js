import express from "express";
import { isAdmin } from "../middleware/auth.middleware.js";
import * as adminController from "../controllers/admin.controller.js";

const router = express.Router();

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get comprehensive dashboard stats for Admin and Super Admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *       403:
 *         description: Access denied
 */
router.get("/stats", isAdmin, adminController.getAdminStats);

export default router;
