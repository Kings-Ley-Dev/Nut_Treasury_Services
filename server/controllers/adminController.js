import User from "../models/User.js";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";
import Card from "../models/Card.js";
import Beneficiary from "../models/Beneficiary.js";
import Notification from "../models/Notification.js";
import Loan from "../models/Loan.js";
import Ticket from "../models/Ticket.js";
import Invite from "../models/Invite.js";
import AuditLog from "../models/AuditLog.js";
import { asyncHandler } from "../utils/helpers.js";
import { audit, notify } from "../utils/services.js";

/* ─────────── User management ─────────── */

export const listUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status) filter.status = req.query.status;
  const users = await User.find(filter).sort("-createdAt");
  res.json({ success: true, count: users.length, users });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body; // approved | rejected | suspended | pending
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  if (user.role === "admin") {
    res.status(403);
    throw new Error("Admin accounts cannot be modified here");
  }
  user.status = status;
  await user.save();

  // Activate/deactivate their accounts to match
  if (status === "approved") {
    await Account.updateMany({ owner: user._id, status: "pending" }, { status: "active" });
  } else if (status === "suspended" || status === "rejected") {
    await Account.updateMany({ owner: user._id }, { status: "frozen" });
  }

  await audit(req.user, "user.status", user.email, { status });
  await notify(user._id, "Account update", `Your account is now ${status}.`, status === "approved" ? "success" : "warning");
  res.json({ success: true, user });
});

export const verifyKyc = asyncHandler(async (req, res) => {
  const { decision } = req.body; // verified | rejected
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.kyc.status = decision;
  user.kyc.reviewedAt = new Date();
  if (decision === "verified" && user.status === "pending") {
    user.status = "approved";
    await Account.updateMany({ owner: user._id, status: "pending" }, { status: "active" });
  }
  await user.save();
  await audit(req.user, "kyc.review", user.email, { decision });
  await notify(user._id, "KYC review", `Your identity verification was ${decision}.`, decision === "verified" ? "success" : "warning");
  res.json({ success: true, user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  if (user.role === "admin") {
    res.status(403);
    throw new Error("Admin accounts cannot be deleted here");
  }
  await Promise.all([
    Account.deleteMany({ owner: user._id }),
    Card.deleteMany({ owner: user._id }),
    Beneficiary.deleteMany({ owner: user._id }),
    Notification.deleteMany({ user: user._id }),
  ]);
  await user.deleteOne();
  await audit(req.user, "user.delete", user.email, { role: user.role });
  res.json({ success: true, message: "User deleted" });
});

/* ─────────── Employee invites ─────────── */

export const createInvite = asyncHandler(async (req, res) => {
  const { email, department } = req.body;
  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(409);
    throw new Error("A user with that email already exists");
  }
  const invite = await Invite.create({ email, department, role: "employee", createdBy: req.user._id });
  await audit(req.user, "invite.create", email, { department });
  res.status(201).json({ success: true, invite, token: invite.token });
});

export const listInvites = asyncHandler(async (req, res) => {
  const invites = await Invite.find().sort("-createdAt");
  res.json({ success: true, invites });
});

export const revokeInvite = asyncHandler(async (req, res) => {
  await Invite.deleteOne({ _id: req.params.id });
  await audit(req.user, "invite.revoke", req.params.id);
  res.json({ success: true, message: "Invite revoked" });
});

/* ─────────── Transaction monitoring & fraud ─────────── */

export const allTransactions = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.flagged === "true") filter.flagged = true;
  const transactions = await Transaction.find(filter).populate("owner", "name email").sort("-createdAt").limit(300);
  res.json({ success: true, count: transactions.length, transactions });
});

export const fraudAlerts = asyncHandler(async (req, res) => {
  const alerts = await Transaction.find({ flagged: true }).populate("owner", "name email").sort("-createdAt").limit(100);
  res.json({ success: true, count: alerts.length, alerts });
});

/* ─────────── Audit logs ─────────── */

export const auditLogs = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find().sort("-createdAt").limit(200);
  res.json({ success: true, count: logs.length, logs });
});

/* ─────────── Reports ─────────── */

export const reports = asyncHandler(async (req, res) => {
  const [users, accounts, loans, tickets] = await Promise.all([
    User.find().select("role status"),
    Account.find().select("balance status"),
    Loan.find().select("status amount outstanding"),
    Ticket.find().select("status"),
  ]);

  const byRole = { customer: 0, employee: 0, admin: 0 };
  const byStatus = { pending: 0, approved: 0, rejected: 0, suspended: 0 };
  users.forEach((u) => { byRole[u.role] = (byRole[u.role] || 0) + 1; byStatus[u.status] = (byStatus[u.status] || 0) + 1; });

  const totalDeposits = accounts.reduce((s, a) => s + a.balance, 0);
  const loansByStatus = {};
  let totalDisbursed = 0;
  let totalOutstanding = 0;
  loans.forEach((l) => {
    loansByStatus[l.status] = (loansByStatus[l.status] || 0) + 1;
    if (["disbursed", "repaying", "closed"].includes(l.status)) totalDisbursed += l.amount;
    totalOutstanding += l.outstanding || 0;
  });
  const openTickets = tickets.filter((t) => t.status !== "resolved").length;

  res.json({
    success: true,
    report: {
      users: { total: users.length, byRole, byStatus },
      deposits: { totalDeposits, accounts: accounts.length },
      loans: { total: loans.length, byStatus: loansByStatus, totalDisbursed, totalOutstanding },
      tickets: { total: tickets.length, open: openTickets },
    },
  });
});

/* ─────────── Staff customer lookup (employee + admin) ─────────── */

export const customerLookup = asyncHandler(async (req, res) => {
  const q = req.query.q || "";
  const filter = { role: "customer" };
  if (q) filter.$or = [{ name: new RegExp(q, "i") }, { email: new RegExp(q, "i") }];
  const customers = await User.find(filter).select("name email status kyc phone createdAt").limit(50).sort("-createdAt");
  res.json({ success: true, customers });
});
