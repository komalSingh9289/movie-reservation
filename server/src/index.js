import dotenv from "dotenv";
dotenv.config();

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

connectDB();

const app = express();

console.log("CLERK_PUBLISHABLE_KEY:", process.env.CLERK_PUBLISHABLE_KEY ? "Present" : "Missing");
console.log("CLERK_SECRET_KEY:", process.env.CLERK_SECRET_KEY ? "Present" : "Missing");

app.use(cors());
app.use(express.json());

app.use(
  clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,
    // Avoid passing undefined if PK is missing, let it fall back to env or SK only
    ...(process.env.CLERK_PUBLISHABLE_KEY && { publishableKey: process.env.CLERK_PUBLISHABLE_KEY }),
  })
);

app.use("/movies", movieRoutes);
app.use("/shows", showRoutes);
app.use("/users", userRoutes);
app.use("/bookings", bookingRoutes);
app.use("/theaters", theaterRoutes);
app.use("/organization-movies", organizationMovieRoutes);
app.use("/categories", categoryRoutes);
app.use("/admin", adminRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
