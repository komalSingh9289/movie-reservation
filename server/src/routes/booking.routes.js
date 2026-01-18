import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import * as bookingController from "../controllers/booking.controller.js";

const router = express.Router();

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - showId
 *               - seats
 *               - totalAmount
 *             properties:
 *               showId:
 *                 type: string
 *               seats:
 *                 type: array
 *                 items:
 *                   type: string
 *               totalAmount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Booking created successfully
 */
router.post("/", requireAuth, bookingController.createBooking);

/**
 * @swagger
 * /bookings/user:
 *   get:
 *     summary: Get user-specific bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user bookings
 */
router.get("/user", requireAuth, bookingController.getUserBookings);

/**
 * @swagger
 * /bookings/theater:
 *   get:
 *     summary: Get theater-specific bookings (Admin/Super Admin)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of theater bookings
 *       403:
 *         description: Unauthorized
 */
router.get("/theater", requireAuth, bookingController.getTheaterBookings);

/**
 * @swagger
 * /bookings/stats:
 *   get:
 *     summary: Get booking statistics (Revenue & Tickets Sold)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Booking statistics
 *       403:
 *         description: Unauthorized
 */
router.get("/stats", requireAuth, bookingController.getBookingStats);

export default router;
