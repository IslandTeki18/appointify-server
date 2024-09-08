import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { errorMiddleware } from "./src/middleware/error.middleware.js";
import authRoutes from "./src/routes/auth.routes.js";
import eventTypeRoutes from "./src/routes/eventType.routes.js";
import appointmentRoutes from "./src/routes/appointment.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import connectDB from "./src/config/database.js";

dotenv.config();
connectDB();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/event-types", eventTypeRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/users", userRoutes);

// Error handling middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
