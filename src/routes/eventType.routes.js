import express from "express";
import {
  createEventType,
  getEventTypes,
  getEventType,
  updateEventType,
  getAvailableDates,
  getAvailableSlotsForDate,
  deleteEventType,
} from "../services/eventType.service.js";
import { validateEventType } from "../middleware/validation.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getEventTypes);
router.get("/:id", getEventType);
router.get("/:id/available-dates", getAvailableDates);
router.get("/:id/available-slots", getAvailableSlotsForDate);

router.post("/", authenticate, validateEventType, createEventType);
router.put("/:id", authenticate, validateEventType, updateEventType);
router.delete("/:id", authenticate, deleteEventType);

export default router;
