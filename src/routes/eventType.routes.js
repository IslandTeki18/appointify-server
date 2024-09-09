import express from "express";
import {
  createEventType,
  getEventTypes,
  getEventType,
  updateEventType,
  deleteEventType,
} from "../services/eventType.service.js";
import { validateEventType } from "../middleware/validation.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.post("/", validateEventType, createEventType);
router.get("/", getEventTypes);
router.get("/:id", getEventType);
router.put("/:id", validateEventType, updateEventType);
router.delete("/:id", deleteEventType);

export default router;
