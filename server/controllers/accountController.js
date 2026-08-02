import AccountApplication from "../models/AccountApplication.js";
import { asyncHandler, handleValidation } from "../utils/helpers.js";

// @desc   Submit a new account-opening application
// @route  POST /api/accounts
export const createAccountApplication = asyncHandler(async (req, res) => {
  if (handleValidation(req, res)) return;

  const application = await AccountApplication.create({
    ...req.body,
    user: req.user ? req.user._id : null,
  });

  res.status(201).json({
    success: true,
    message: `Application received. Your reference is ${application.reference}.`,
    reference: application.reference,
    application,
  });
});

// @desc   List the logged-in user's account applications
// @route  GET /api/accounts/mine  (protected)
export const getMyAccountApplications = asyncHandler(async (req, res) => {
  const apps = await AccountApplication.find({ user: req.user._id }).sort(
    "-createdAt"
  );
  res.json({ success: true, count: apps.length, applications: apps });
});

// @desc   List every account application (admin)
// @route  GET /api/accounts  (admin)
export const getAllAccountApplications = asyncHandler(async (req, res) => {
  const apps = await AccountApplication.find().sort("-createdAt");
  res.json({ success: true, count: apps.length, applications: apps });
});

// @desc   Update an application's status (admin)
// @route  PATCH /api/accounts/:id/status  (admin)
export const updateAccountStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const app = await AccountApplication.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );
  if (!app) {
    res.status(404);
    throw new Error("Application not found");
  }
  res.json({ success: true, application: app });
});
