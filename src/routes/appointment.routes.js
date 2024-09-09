import express from "express";
import {
  createAppointment,
  getAppointments,
  cancelAppointment,
} from "../services/appointment.service.js";
import { validateAppointment } from "../middleware/validation.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", validateAppointment, createAppointment);
router.get("/", authenticate, getAppointments);
router.put("/:id/cancel", authenticate, cancelAppointment);

export default router;
