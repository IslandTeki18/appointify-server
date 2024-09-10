import express from "express";
import { register, login } from "../services/auth.service.js";
import {
  validateLogin,
  validateRegistration,
} from "../middleware/validation.middleware.js";

const router = express.Router();

router.post("/register", validateRegistration, register);
router.post("/login", validateLogin, login);

export default router;
