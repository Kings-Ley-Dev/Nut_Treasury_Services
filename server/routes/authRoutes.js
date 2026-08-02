import express from "express";
import { body } from "express-validator";
import {
  register,
  adminRegister,
  employeeRegister,
  checkInvite,
  login,
  getMe,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const pw = body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters");

router.post(
  "/register",
  [body("name").trim().notEmpty().withMessage("Full name is required"), body("email").isEmail().withMessage("A valid email is required"), pw],
  register
);

router.post(
  "/admin/register",
  [body("name").trim().notEmpty(), body("email").isEmail(), pw, body("code").notEmpty().withMessage("Setup code is required")],
  adminRegister
);

router.post(
  "/employee/register",
  [body("name").trim().notEmpty(), pw, body("token").notEmpty().withMessage("Invite token is required")],
  employeeRegister
);

router.get("/employee/invite/:token", checkInvite);

router.post(
  "/login",
  [body("email").isEmail().withMessage("A valid email is required"), body("password").notEmpty().withMessage("Password is required")],
  login
);

router.get("/me", protect, getMe);

export default router;
