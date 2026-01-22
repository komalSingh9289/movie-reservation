import dotenv from "dotenv";
dotenv.config();
import { Server } from "socket.io";
import http from "http";

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

import movieRoutes from "./routes/movie.routes.js";
import showRoutes from "./routes/show.routes.js";
import userRoutes from "./routes/user.route.js";
import bookingRoutes from "./routes/booking.routes.js";
import theaterRoutes from "./routes/theater.route.js";
import organizationMovieRoutes from "./routes/organizationMovie.route.js";
import categoryRoutes from "./routes/category.routes.js";
import adminRoutes from "./routes/admin.routes.js";


import { clerkMiddleware } from "@clerk/express";
import cron from "node-cron";
import { unlockExpiredSeats } from "./utils/unlockExpiredSeats.js";



// Run every minute
cron.schedule("* * * * *", async () => {
  // console.log("[Cron] Running seat auto-unlock check...");
  await unlockExpiredSeats();
});

connectDB();

const app = express();

// console.log("CLERK_PUBLISHABLE_KEY:", process.env.CLERK_PUBLISHABLE_KEY ? "Present" : "Missing");
// console.log("CLERK_SECRET_KEY:", process.env.CLERK_SECRET_KEY ? "Present" : "Missing");

app.use(cors());
app.use(express.json());

app.use(clerkMiddleware());

app.use("/movies", movieRoutes);
app.use("/shows", showRoutes);
app.use("/users", userRoutes);
app.use("/bookings", bookingRoutes);
app.use("/theaters", theaterRoutes);
app.use("/organization-movies", organizationMovieRoutes);
app.use("/categories", categoryRoutes);
app.use("/admin", adminRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ------------------ HTTP + SOCKET ------------------
const server = http.createServer(app);
import { initSocket } from "./config/socket.js";
initSocket(server);



const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
