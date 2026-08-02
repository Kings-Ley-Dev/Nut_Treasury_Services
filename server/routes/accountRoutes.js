import express from "express";
import { body } from "express-validator";
import {
  createAccountApplication,
  getMyAccountApplications,
  getAllAccountApplications,
  updateAccountStatus,
} from "../controllers/accountController.js";
import { protect, authorize } from "../middleware/auth.js";
import { optionalAuth } from "../middleware/optionalAuth.js";

const router = express.Router();

const validateApplication = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("email").isEmail().withMessage("A valid email is required"),
  body("phone").trim().notEmpty().withMessage("Phone number is required"),
  body("idNumber").trim().notEmpty().withMessage("ID number is required"),
  body("address").trim().notEmpty().withMessage("Residential address is required"),
  body("accountType").trim().notEmpty().withMessage("Select an account type"),
];

// Public (optionally links to a logged-in user) submit
router.post("/", optionalAuth, validateApplication, createAccountApplication);

// Customer's own applications
router.get("/mine", protect, getMyAccountApplications);

// Admin
router.get("/", protect, authorize("admin"), getAllAccountApplications);
router.patch("/:id/status", protect, authorize("admin"), updateAccountStatus);

export default router;
