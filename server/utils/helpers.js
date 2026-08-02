import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

/** Sign a JWT for a given user id. */
export const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

/** Wrap async controllers so thrown errors reach the error handler. */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/** Collect express-validator errors; returns true if a response was sent. */
export const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
    return true;
  }
  return false;
};

/**
 * Standard reducing-balance EMI calculation.
 * @param {number} principal  loan amount
 * @param {number} annualRate interest rate in percent (e.g. 18 for 18%)
 * @param {number} months     repayment term in months
 */
export const calculateEMI = (principal, annualRate, months) => {
  const r = annualRate / 100 / 12;
  let emi;
  if (r === 0) {
    emi = principal / months;
  } else {
    emi =
      (principal * r * Math.pow(1 + r, months)) /
      (Math.pow(1 + r, months) - 1);
  }
  const totalPayable = emi * months;
  return {
    monthlyEmi: Math.round(emi * 100) / 100,
    totalPayable: Math.round(totalPayable * 100) / 100,
    totalInterest: Math.round((totalPayable - principal) * 100) / 100,
  };
};
