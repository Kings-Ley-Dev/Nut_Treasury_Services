import LoanApplication from "../models/LoanApplication.js";
import {
  asyncHandler,
  handleValidation,
  calculateEMI,
} from "../utils/helpers.js";

// @desc   Calculate an EMI breakdown (no auth, no save)
// @route  POST /api/loans/calculate
export const calculateLoan = asyncHandler(async (req, res) => {
  const amount = Number(req.body.amount);
  const termMonths = Number(req.body.termMonths);
  const interestRate = Number(req.body.interestRate);

  if (
    !Number.isFinite(amount) ||
    !Number.isFinite(termMonths) ||
    !Number.isFinite(interestRate) ||
    amount <= 0 ||
    termMonths <= 0
  ) {
    res.status(400);
    throw new Error("Provide a valid amount, term and interest rate");
  }

  const result = calculateEMI(amount, interestRate, termMonths);
  res.json({ success: true, ...result });
});

// @desc   Submit a loan application
// @route  POST /api/loans
export const createLoanApplication = asyncHandler(async (req, res) => {
  if (handleValidation(req, res)) return;

  const { amount, interestRate, termMonths } = req.body;
  const { monthlyEmi, totalPayable } = calculateEMI(
    Number(amount),
    Number(interestRate),
    Number(termMonths)
  );

  const application = await LoanApplication.create({
    ...req.body,
    monthlyEmi,
    totalPayable,
    user: req.user ? req.user._id : null,
  });

  res.status(201).json({
    success: true,
    message: `Loan request received. Your reference is ${application.reference}.`,
    reference: application.reference,
    application,
  });
});

// @desc   List the logged-in user's loan applications
// @route  GET /api/loans/mine  (protected)
export const getMyLoanApplications = asyncHandler(async (req, res) => {
  const apps = await LoanApplication.find({ user: req.user._id }).sort(
    "-createdAt"
  );
  res.json({ success: true, count: apps.length, applications: apps });
});

// @desc   List every loan application (admin)
// @route  GET /api/loans  (admin)
export const getAllLoanApplications = asyncHandler(async (req, res) => {
  const apps = await LoanApplication.find().sort("-createdAt");
  res.json({ success: true, count: apps.length, applications: apps });
});

// @desc   Update a loan application's status (admin)
// @route  PATCH /api/loans/:id/status  (admin)
export const updateLoanStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const app = await LoanApplication.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );
  if (!app) {
    res.status(404);
    throw new Error("Loan application not found");
  }
  res.json({ success: true, application: app });
});
