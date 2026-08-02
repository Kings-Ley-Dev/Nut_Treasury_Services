import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";
import Beneficiary from "../models/Beneficiary.js";
import Card from "../models/Card.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/helpers.js";
import { fraudCheck, notify, audit } from "../utils/services.js";

/* ─────────── Accounts & overview ─────────── */

export const myAccounts = asyncHandler(async (req, res) => {
  const accounts = await Account.find({ owner: req.user._id }).sort("createdAt");
  res.json({ success: true, accounts });
});

export const overview = asyncHandler(async (req, res) => {
  const accounts = await Account.find({ owner: req.user._id });
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const recent = await Transaction.find({ owner: req.user._id }).sort("-createdAt").limit(6);
  const unreadNotifications = await Notification.countDocuments({ user: req.user._id, read: false });
  res.json({
    success: true,
    totalBalance,
    accountCount: accounts.length,
    accounts,
    recent,
    unreadNotifications,
  });
});

/* ─────────── Transactions & statements ─────────── */

export const myTransactions = asyncHandler(async (req, res) => {
  const filter = { owner: req.user._id };
  if (req.query.accountId) filter.account = req.query.accountId;
  const transactions = await Transaction.find(filter).sort("-createdAt").limit(200);
  res.json({ success: true, count: transactions.length, transactions });
});

/* ─────────── Transfers ─────────── */

export const transfer = asyncHandler(async (req, res) => {
  const { fromAccountId, toAccountNumber, amount, description } = req.body;
  const value = Number(amount);
  if (!value || value <= 0) {
    res.status(400);
    throw new Error("Enter a valid amount");
  }

  const from = await Account.findOne({ _id: fromAccountId, owner: req.user._id });
  if (!from) {
    res.status(404);
    throw new Error("Source account not found");
  }
  if (from.status !== "active") {
    res.status(403);
    throw new Error("This account is not active yet");
  }
  if (from.balance < value) {
    res.status(400);
    throw new Error("Insufficient funds");
  }

  const flag = fraudCheck(value);

  // Debit sender
  from.balance -= value;
  await from.save();
  await Transaction.create({
    account: from._id,
    owner: req.user._id,
    type: "transfer-out",
    amount: value,
    balanceAfter: from.balance,
    description: description || "Transfer",
    counterparty: toAccountNumber,
    flagged: flag.flagged,
    flagReason: flag.flagReason,
  });

  // Credit receiver if internal
  const to = await Account.findOne({ accountNumber: toAccountNumber });
  if (to) {
    to.balance += value;
    await to.save();
    await Transaction.create({
      account: to._id,
      owner: to.owner,
      type: "transfer-in",
      amount: value,
      balanceAfter: to.balance,
      description: description || "Transfer received",
      counterparty: from.accountNumber,
      flagged: flag.flagged,
      flagReason: flag.flagReason,
    });
    await notify(to.owner, "Money received", `You received $${value.toLocaleString()} from ${req.user.name}.`, "success");
  }

  await notify(req.user._id, "Transfer sent", `$${value.toLocaleString()} sent to ${toAccountNumber}.`, "success");

  res.json({ success: true, message: "Transfer completed", balance: from.balance });
});

/* ─────────── Beneficiaries ─────────── */

export const listBeneficiaries = asyncHandler(async (req, res) => {
  const beneficiaries = await Beneficiary.find({ owner: req.user._id }).sort("-createdAt");
  res.json({ success: true, beneficiaries });
});

export const addBeneficiary = asyncHandler(async (req, res) => {
  const { name, accountNumber, bankName, nickname } = req.body;
  if (!name || !accountNumber) {
    res.status(400);
    throw new Error("Name and account number are required");
  }
  const internal = !!(await Account.findOne({ accountNumber }));
  const beneficiary = await Beneficiary.create({
    owner: req.user._id,
    name,
    accountNumber,
    bankName: bankName || "Nut Treasury Services",
    nickname,
    internal,
  });
  res.status(201).json({ success: true, beneficiary });
});

export const deleteBeneficiary = asyncHandler(async (req, res) => {
  await Beneficiary.deleteOne({ _id: req.params.id, owner: req.user._id });
  res.json({ success: true, message: "Beneficiary removed" });
});

/* ─────────── Cards ─────────── */

export const listCards = asyncHandler(async (req, res) => {
  const cards = await Card.find({ owner: req.user._id }).sort("-createdAt");
  res.json({ success: true, cards });
});

export const issueCard = asyncHandler(async (req, res) => {
  const account = await Account.findOne({ owner: req.user._id });
  if (!account) {
    res.status(400);
    throw new Error("You need an account before issuing a card");
  }
  const now = new Date();
  const expiry = `${String(now.getMonth() + 1).padStart(2, "0")}/${String((now.getFullYear() + 4) % 100).padStart(2, "0")}`;
  const card = await Card.create({
    owner: req.user._id,
    account: account._id,
    holderName: req.user.name,
    last4: String(Math.floor(1000 + Math.random() * 8999)),
    type: req.body.type === "physical" ? "physical" : "virtual",
    expiry,
  });
  await notify(req.user._id, "New card issued", `A ${card.type} card ending ${card.last4} was created.`, "success");
  res.status(201).json({ success: true, card });
});

export const updateCard = asyncHandler(async (req, res) => {
  const card = await Card.findOne({ _id: req.params.id, owner: req.user._id });
  if (!card) {
    res.status(404);
    throw new Error("Card not found");
  }
  const { status, dailyLimit } = req.body;
  if (status) card.status = status;
  if (dailyLimit != null) card.dailyLimit = Number(dailyLimit);
  await card.save();
  res.json({ success: true, card });
});

/* ─────────── Notifications ─────────── */

export const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort("-createdAt").limit(50);
  res.json({ success: true, notifications });
});

export const markNotification = asyncHandler(async (req, res) => {
  await Notification.updateOne({ _id: req.params.id, user: req.user._id }, { read: true });
  res.json({ success: true });
});

export const markAllNotifications = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id }, { read: true });
  res.json({ success: true });
});

/* ─────────── Security ─────────── */

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    res.status(400);
    throw new Error("New password must be at least 6 characters");
  }
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }
  user.password = newPassword;
  await user.save();
  await notify(user._id, "Password changed", "Your password was updated successfully.", "security");
  res.json({ success: true, message: "Password updated" });
});

/* ─────────── KYC submission ─────────── */

export const submitKyc = asyncHandler(async (req, res) => {
  const { idType, idNumber, dateOfBirth, residency, taxIdType, address } = req.body;
  const user = await User.findById(req.user._id);
  user.kyc = {
    ...user.kyc.toObject?.() ?? user.kyc,
    status: "pending",
    idType,
    idNumber,
    dateOfBirth,
    residency,
    taxIdType,
    address,
    submittedAt: new Date(),
  };
  await user.save();
  await notify(user._id, "KYC submitted", "Your identity details are under review.", "info");
  res.json({ success: true, message: "KYC submitted for review", kyc: user.kyc });
});
