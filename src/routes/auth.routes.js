import express from "express";
import { register, login, logout } from "../services/auth.service.js";
import {
  validateLogin,
  validateRegistration,
} from "../middleware/validation.middleware.js";

const router = express.Router();

router.post("/register", validateRegistration, register);
router.post("/login", validateLogin, login);
router.post("/logout", logout);

export default router;
