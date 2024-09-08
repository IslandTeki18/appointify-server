import express from "express";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validateUserUpdate } from "../validators/user.validator";

const router = express.Router();

router.use(authenticate);

router.get("/profile", getUserProfile);
router.put("/profile", validateUserUpdate, updateUserProfile);

export default router;
