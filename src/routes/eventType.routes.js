import express from "express";
import {
  createEventType,
  getEventTypes,
  getEventType,
  updateEventType,
  deleteEventType,
} from "../controllers/eventType.controller";
import { validateEventType } from "../validators/eventType.validator";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

router.use(authenticate);

router.post("/", validateEventType, createEventType);
router.get("/", getEventTypes);
router.get("/:id", getEventType);
router.put("/:id", validateEventType, updateEventType);
router.delete("/:id", deleteEventType);

export default router;
