import User from "../models/User.js";
import Account from "../models/Account.js";
import Invite from "../models/Invite.js";
import { asyncHandler, generateToken, handleValidation } from "../utils/helpers.js";
import { audit, notify } from "../utils/services.js";

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  status: u.status,
  kyc: u.kyc,
  department: u.department,
});

// @desc   Register a new customer (self-service). Starts pending KYC/approval.
// @route  POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  if (handleValidation(req, res)) return;
  const { name, email, phone, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409);
    throw new Error("An account with that email already exists");
  }

  const user = await User.create({ name, email, phone, password, role: "customer", status: "pending" });
  // Provision a primary account (inactive until approved)
  await Account.create({ owner: user._id, type: "Everyday Savings", status: "pending" });
  await notify(user._id, "Welcome to Nut Treasury Services", "Your account is pending review. Complete your KYC to speed things up.", "info");

  res.status(201).json({
    success: true,
    message: "Account created. It is pending approval by our team.",
    token: generateToken(user._id),
    user: publicUser(user),
  });
});

// @desc   Register an admin using a one-time setup code (no seeding required)
// @route  POST /api/auth/admin/register
export const adminRegister = asyncHandler(async (req, res) => {
  if (handleValidation(req, res)) return;
  const { name, email, phone, password, code } = req.body;

  if (!process.env.ADMIN_SIGNUP_CODE || code !== process.env.ADMIN_SIGNUP_CODE) {
    res.status(403);
    throw new Error("Invalid admin setup code");
  }
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409);
    throw new Error("An account with that email already exists");
  }

  const user = await User.create({ name, email, phone, password, role: "admin", status: "approved" });
  await audit(user, "admin.register", email);

  res.status(201).json({
    success: true,
    message: "Admin account created",
    token: generateToken(user._id),
    user: publicUser(user),
  });
});

// @desc   Register an employee using an invite token issued by an admin
// @route  POST /api/auth/employee/register
export const employeeRegister = asyncHandler(async (req, res) => {
  if (handleValidation(req, res)) return;
  const { name, phone, password, token } = req.body;

  const invite = await Invite.findOne({ token, used: false });
  if (!invite || invite.expiresAt < new Date()) {
    res.status(400);
    throw new Error("This invite link is invalid or has expired");
  }
  const exists = await User.findOne({ email: invite.email });
  if (exists) {
    res.status(409);
    throw new Error("An account with that email already exists");
  }

  const user = await User.create({
    name,
    email: invite.email,
    phone,
    password,
    role: "employee",
    status: "approved",
    department: invite.department,
    invitedBy: invite.createdBy,
  });
  invite.used = true;
  await invite.save();
  await audit(user, "employee.register", invite.email, { department: invite.department });

  res.status(201).json({
    success: true,
    message: "Employee account created",
    token: generateToken(user._id),
    user: publicUser(user),
  });
});

// @desc   Validate an invite token (so the signup form can prefill the email)
// @route  GET /api/auth/employee/invite/:token
export const checkInvite = asyncHandler(async (req, res) => {
  const invite = await Invite.findOne({ token: req.params.token, used: false });
  if (!invite || invite.expiresAt < new Date()) {
    res.status(400);
    throw new Error("This invite link is invalid or has expired");
  }
  res.json({ success: true, email: invite.email, department: invite.department });
});

// @desc   Authenticate any user and return a token
// @route  POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  if (handleValidation(req, res)) return;
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }
  if (user.status === "rejected" || user.status === "suspended") {
    res.status(403);
    throw new Error("Your account is not active. Please contact support.");
  }

  user.lastLogin = new Date();
  await user.save();

  res.json({
    success: true,
    message: "Signed in successfully",
    token: generateToken(user._id),
    user: publicUser(user),
  });
});

// @desc   Get the currently authenticated user
// @route  GET /api/auth/me  (protected)
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});
