import MoneyRequest from "../models/MoneyRequest.js";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";
import { asyncHandler } from "../utils/helpers.js";
import { notify, audit, fraudCheck } from "../utils/services.js";
import { sendEmail, defaultDepositDetails } from "../utils/email.js";

/* ═════════ CUSTOMER ═════════ */

// POST /api/bank/deposits  — request a bank deposit
export const requestDeposit = asyncHandler(async (req, res) => {
  const value = Number(req.body.amount);
  if (!value || value <= 0) { res.status(400); throw new Error("Enter a valid amount"); }
  const account = await Account.findOne({ owner: req.user._id });
  const dr = await MoneyRequest.create({
    user: req.user._id,
    account: account?._id,
    kind: "deposit",
    amount: value,
    note: req.body.note || "",
    status: "requested",
  });
  await notify(req.user._id, "Deposit requested", `Your deposit request ${dr.reference} was received. The bank will send you the deposit account details shortly.`, "info");
  res.status(201).json({ success: true, message: "Deposit request submitted", request: dr });
});

// GET /api/bank/deposits
export const myDeposits = asyncHandler(async (req, res) => {
  const requests = await MoneyRequest.find({ user: req.user._id, kind: "deposit" }).sort("-createdAt");
  res.json({ success: true, requests });
});

// POST /api/bank/deposits/:id/paid — customer confirms they've paid
export const confirmDepositPaid = asyncHandler(async (req, res) => {
  const dr = await MoneyRequest.findOne({ _id: req.params.id, user: req.user._id, kind: "deposit" });
  if (!dr) { res.status(404); throw new Error("Deposit request not found"); }
  if (dr.status !== "details-sent") { res.status(400); throw new Error("You can confirm payment only after the bank sends you the account details"); }
  dr.status = "paid";
  await dr.save();
  await notify(req.user._id, "Deposit marked as paid", `We'll confirm ${dr.reference} once the funds are received.`, "info");
  res.json({ success: true, message: "Marked as paid. Awaiting bank confirmation.", request: dr });
});

// POST /api/bank/withdrawals — request a withdrawal
export const requestWithdrawal = asyncHandler(async (req, res) => {
  const value = Number(req.body.amount);
  if (!value || value <= 0) { res.status(400); throw new Error("Enter a valid amount"); }
  const account = await Account.findOne({ owner: req.user._id });
  if (!account) { res.status(404); throw new Error("No account found"); }
  if (account.balance < value) { res.status(400); throw new Error("Insufficient funds for this withdrawal"); }
  const wr = await MoneyRequest.create({
    user: req.user._id,
    account: account._id,
    kind: "withdrawal",
    amount: value,
    destination: req.body.destination || "",
    note: req.body.note || "",
    status: "pending",
  });
  await notify(req.user._id, "Withdrawal requested", `Your withdrawal request ${wr.reference} is pending approval.`, "info");
  res.status(201).json({ success: true, message: "Withdrawal request submitted for approval", request: wr });
});

// GET /api/bank/withdrawals
export const myWithdrawals = asyncHandler(async (req, res) => {
  const requests = await MoneyRequest.find({ user: req.user._id, kind: "withdrawal" }).sort("-createdAt");
  res.json({ success: true, requests });
});

/* ═════════ STAFF (employee + admin) ═════════ */

// GET /api/staff/deposits
export const allDeposits = asyncHandler(async (req, res) => {
  const requests = await MoneyRequest.find({ kind: "deposit" }).populate("user", "name email").sort("-createdAt");
  res.json({ success: true, requests });
});

// POST /api/staff/deposits/:id/details  — send bank account details to the customer
export const sendDepositDetails = asyncHandler(async (req, res) => {
  const dr = await MoneyRequest.findById(req.params.id).populate("user", "name email");
  if (!dr || dr.kind !== "deposit") { res.status(404); throw new Error("Deposit request not found"); }
  const details = (req.body.bankDetails || "").trim() || defaultDepositDetails(dr.reference);
  dr.bankDetails = details;
  dr.status = "details-sent";
  dr.handledBy = req.user._id;
  dr.handledByName = req.user.name;
  dr.handledAt = new Date();
  await dr.save();

  // Channel 1: dashboard notification (always)
  await notify(dr.user._id, `Deposit account details (${dr.reference})`, details, "info");
  // Channel 2: email (if SMTP configured)
  const emailRes = await sendEmail({
    to: dr.user.email,
    subject: `Your Nut Treasury Services deposit details (${dr.reference})`,
    text: `Hello ${dr.user.name},\n\n${details}\n\nThank you,\nNut Treasury Services`,
  });
  await audit(req.user, "deposit.details-sent", dr.reference, { emailed: emailRes.sent });

  res.json({ success: true, message: `Account details sent to the customer${emailRes.sent ? " and emailed" : ""}.`, request: dr });
});

// POST /api/staff/deposits/:id/confirm  — confirm funds received, credit the account
export const confirmDeposit = asyncHandler(async (req, res) => {
  const dr = await MoneyRequest.findById(req.params.id);
  if (!dr || dr.kind !== "deposit") { res.status(404); throw new Error("Deposit request not found"); }
  if (!["details-sent", "paid"].includes(dr.status)) { res.status(400); throw new Error("This deposit cannot be confirmed in its current state"); }

  let account = await Account.findById(dr.account) || await Account.findOne({ owner: dr.user });
  if (!account) { res.status(400); throw new Error("Customer has no account to credit"); }

  const flag = fraudCheck(dr.amount);
  account.balance += dr.amount;
  if (account.status === "pending") account.status = "active";
  await account.save();
  await Transaction.create({
    account: account._id, owner: dr.user, type: "deposit", amount: dr.amount,
    balanceAfter: account.balance, description: `Deposit ${dr.reference}`,
    flagged: flag.flagged, flagReason: flag.flagReason,
  });

  dr.status = "received";
  dr.handledBy = req.user._id;
  dr.handledByName = req.user.name;
  dr.handledAt = new Date();
  await dr.save();

  await audit(req.user, "deposit.confirm", dr.reference, { amount: dr.amount });
  await notify(dr.user, "Deposit received", `Your deposit ${dr.reference} of $${dr.amount.toLocaleString()} has been credited to your account.`, "success");
  res.json({ success: true, message: "Deposit confirmed and credited", request: dr });
});

// POST /api/staff/deposits/:id/reject
export const rejectDeposit = asyncHandler(async (req, res) => {
  const dr = await MoneyRequest.findById(req.params.id);
  if (!dr || dr.kind !== "deposit") { res.status(404); throw new Error("Deposit request not found"); }
  dr.status = "rejected";
  dr.handledBy = req.user._id;
  dr.handledByName = req.user.name;
  dr.handledAt = new Date();
  await dr.save();
  await audit(req.user, "deposit.reject", dr.reference);
  await notify(dr.user, "Deposit rejected", `Your deposit request ${dr.reference} was rejected. Please contact support.`, "warning");
  res.json({ success: true, message: "Deposit rejected", request: dr });
});

// GET /api/staff/withdrawals
export const allWithdrawals = asyncHandler(async (req, res) => {
  const requests = await MoneyRequest.find({ kind: "withdrawal" }).populate("user", "name email").sort("-createdAt");
  res.json({ success: true, requests });
});

// POST /api/staff/withdrawals/:id/approve — debit the account and complete
export const approveWithdrawal = asyncHandler(async (req, res) => {
  const wr = await MoneyRequest.findById(req.params.id);
  if (!wr || wr.kind !== "withdrawal") { res.status(404); throw new Error("Withdrawal request not found"); }
  if (wr.status !== "pending") { res.status(400); throw new Error("This withdrawal is not pending"); }

  const account = await Account.findById(wr.account) || await Account.findOne({ owner: wr.user });
  if (!account) { res.status(400); throw new Error("Customer has no account"); }
  if (account.balance < wr.amount) { res.status(400); throw new Error("Customer has insufficient funds"); }

  const flag = fraudCheck(wr.amount);
  account.balance -= wr.amount;
  await account.save();
  await Transaction.create({
    account: account._id, owner: wr.user, type: "withdrawal", amount: wr.amount,
    balanceAfter: account.balance, description: `Withdrawal ${wr.reference}`,
    flagged: flag.flagged, flagReason: flag.flagReason,
  });

  wr.status = "approved";
  wr.handledBy = req.user._id;
  wr.handledByName = req.user.name;
  wr.handledAt = new Date();
  await wr.save();

  await audit(req.user, "withdrawal.approve", wr.reference, { amount: wr.amount });
  await notify(wr.user, "Withdrawal approved", `Your withdrawal ${wr.reference} of $${wr.amount.toLocaleString()} has been approved and processed.`, "success");
  res.json({ success: true, message: "Withdrawal approved", request: wr });
});

// POST /api/staff/withdrawals/:id/reject
export const rejectWithdrawal = asyncHandler(async (req, res) => {
  const wr = await MoneyRequest.findById(req.params.id);
  if (!wr || wr.kind !== "withdrawal") { res.status(404); throw new Error("Withdrawal request not found"); }
  wr.status = "rejected";
  wr.handledBy = req.user._id;
  wr.handledByName = req.user.name;
  wr.handledAt = new Date();
  await wr.save();
  await audit(req.user, "withdrawal.reject", wr.reference);
  await notify(wr.user, "Withdrawal rejected", `Your withdrawal request ${wr.reference} was rejected. Please contact support.`, "warning");
  res.json({ success: true, message: "Withdrawal rejected", request: wr });
});
