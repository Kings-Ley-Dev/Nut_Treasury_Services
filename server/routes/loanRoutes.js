import express from "express";
import { body } from "express-validator";
import {
  calculateLoan,
  createLoanApplication,
  getMyLoanApplications,
  getAllLoanApplications,
  updateLoanStatus,
} from "../controllers/loanController.js";
import { protect, authorize } from "../middleware/auth.js";
import { optionalAuth } from "../middleware/optionalAuth.js";

const router = express.Router();

const validateLoan = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("email").isEmail().withMessage("A valid email is required"),
  body("phone").trim().notEmpty().withMessage("Phone number is required"),
  body("loanType").trim().notEmpty().withMessage("Select a loan type"),
  body("amount").isFloat({ min: 100 }).withMessage("Enter a valid loan amount"),
  body("termMonths").isInt({ min: 1 }).withMessage("Enter a valid term"),
  body("purpose").trim().notEmpty().withMessage("Tell us the loan purpose"),
];

// Public EMI calculator
router.post("/calculate", calculateLoan);

// Submit a loan application
router.post("/", optionalAuth, validateLoan, createLoanApplication);

// Customer's own loans
router.get("/mine", protect, getMyLoanApplications);

// Admin
router.get("/", protect, authorize("admin"), getAllLoanApplications);
router.patch("/:id/status", protect, authorize("admin"), updateLoanStatus);

export default router;
