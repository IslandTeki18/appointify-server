import express from "express";
import { getUserProfile, updateUserProfile } from "../services/user.service.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateUserUpdate } from "../middleware/validation.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/profile", getUserProfile);
router.put("/profile", validateUserUpdate, updateUserProfile);

export default router;
