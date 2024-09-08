import express from "express";
import {
  createAppointment,
  getAppointments,
  cancelAppointment,
} from "../controllers/appointment.controller";
import { validateAppointment } from "../validators/appointment.validator";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/", validateAppointment, createAppointment);
router.get("/", authenticate, getAppointments);
router.put("/:id/cancel", authenticate, cancelAppointment);

export default router;
