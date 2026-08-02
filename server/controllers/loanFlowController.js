import Loan from "../models/Loan.js";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import { asyncHandler, calculateEMI } from "../utils/helpers.js";
import { assessRisk, notify, audit } from "../utils/services.js";

/* ─────────── Customer ─────────── */

// @route POST /api/bank/loans  (customer, approved)
export const applyLoan = asyncHandler(async (req, res) => {
  const { loanType, amount, termMonths, interestRate, purpose, employmentStatus, monthlyIncome } = req.body;
  const principal = Number(amount);
  const term = Number(termMonths);
  const rate = Number(interestRate);
  if (!principal || !term || !rate) {
    res.status(400);
    throw new Error("Amount, term and interest rate are required");
  }

  const { monthlyEmi, totalPayable, totalInterest } = calculateEMI(principal, rate, term);
  const risk = assessRisk({ amount: principal, monthlyIncome: Number(monthlyIncome) || 0, termMonths: term, employmentStatus, monthlyEmi });
  const account = await Account.findOne({ owner: req.user._id });

  const loan = await Loan.create({
    applicant: req.user._id,
    account: account?._id,
    loanType,
    amount: principal,
    termMonths: term,
    interestRate: rate,
    purpose,
    employmentStatus,
    monthlyIncome: Number(monthlyIncome) || 0,
    monthlyEmi,
    totalPayable,
    totalInterest,
    ...risk,
    status: "pending",
  });
  await notify(req.user._id, "Loan application received", `Your ${loanType} request (${loan.reference}) is under review.`, "info");
  res.status(201).json({ success: true, message: "Loan application submitted", loan });
});

// @route GET /api/bank/loans  (customer)
export const myLoans = asyncHandler(async (req, res) => {
  const loans = await Loan.find({ applicant: req.user._id }).sort("-createdAt");
  res.json({ success: true, loans });
});

// @route POST /api/bank/loans/:id/repay  (customer, approved)
export const repayLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findOne({ _id: req.params.id, applicant: req.user._id });
  if (!loan) {
    res.status(404);
    throw new Error("Loan not found");
  }
  if (!["disbursed", "repaying"].includes(loan.status)) {
    res.status(400);
    throw new Error("This loan is not in repayment");
  }

  const account = await Account.findOne({ _id: loan.account, owner: req.user._id });
  if (!account) {
    res.status(404);
    throw new Error("Linked account not found");
  }

  const nextItem = loan.schedule.find((s) => !s.paid);
  const due = Number(req.body.amount) || nextItem?.amount || loan.monthlyEmi;
  const value = Math.min(due, loan.outstanding);
  if (account.balance < value) {
    res.status(400);
    throw new Error("Insufficient funds for this repayment");
  }

  account.balance -= value;
  await account.save();
  loan.outstanding = Math.max(0, Math.round((loan.outstanding - value) * 100) / 100);
  if (nextItem) {
    nextItem.paid = true;
    nextItem.paidAt = new Date();
  }
  loan.status = loan.outstanding <= 0 ? "closed" : "repaying";
  await loan.save();

  await Transaction.create({
    account: account._id,
    owner: req.user._id,
    type: "loan-repayment",
    amount: value,
    balanceAfter: account.balance,
    description: `Loan repayment ${loan.reference}`,
  });
  await notify(req.user._id, "Loan repayment", `$${value.toLocaleString()} repaid on ${loan.reference}. Outstanding: $${loan.outstanding.toLocaleString()}.`, "success");

  res.json({ success: true, message: "Repayment successful", loan, balance: account.balance });
});

/* ─────────── Staff (employee + admin) ─────────── */

// @route GET /api/staff/loans
export const allLoans = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const loans = await Loan.find(filter).populate("applicant", "name email").sort("-createdAt");
  res.json({ success: true, count: loans.length, loans });
});

// @route PATCH /api/staff/loans/:id/review
export const reviewLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);
  if (!loan) {
    res.status(404);
    throw new Error("Loan not found");
  }
  loan.status = "under-review";
  await loan.save();
  await audit(req.user, "loan.review", loan.reference);
  res.json({ success: true, loan });
});

// @route PATCH /api/staff/loans/:id/decision   body:{decision:"approved"|"rejected"}
export const decideLoan = asyncHandler(async (req, res) => {
  const { decision } = req.body;
  if (!["approved", "rejected"].includes(decision)) {
    res.status(400);
    throw new Error("Decision must be approved or rejected");
  }
  const loan = await Loan.findById(req.params.id);
  if (!loan) {
    res.status(404);
    throw new Error("Loan not found");
  }
  loan.status = decision;
  loan.decisionBy = req.user._id;
  loan.decisionAt = new Date();
  await loan.save();
  await audit(req.user, `loan.${decision}`, loan.reference, { amount: loan.amount });
  await notify(loan.applicant, `Loan ${decision}`, `Your loan ${loan.reference} was ${decision}.`, decision === "approved" ? "success" : "warning");
  res.json({ success: true, loan });
});

// @route POST /api/staff/loans/:id/disburse   (admin only)
export const disburseLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);
  if (!loan) {
    res.status(404);
    throw new Error("Loan not found");
  }
  if (loan.status !== "approved") {
    res.status(400);
    throw new Error("Only approved loans can be disbursed");
  }
  let account = await Account.findById(loan.account);
  if (!account) account = await Account.findOne({ owner: loan.applicant });
  if (!account) {
    res.status(400);
    throw new Error("Applicant has no account to disburse to");
  }

  // Credit the account
  account.balance += loan.amount;
  if (account.status === "pending") account.status = "active";
  await account.save();
  await Transaction.create({
    account: account._id,
    owner: loan.applicant,
    type: "loan-disbursement",
    amount: loan.amount,
    balanceAfter: account.balance,
    description: `Loan disbursement ${loan.reference}`,
  });

  // Build monthly repayment schedule
  const schedule = [];
  const start = new Date();
  for (let i = 1; i <= loan.termMonths; i++) {
    const dueDate = new Date(start);
    dueDate.setMonth(dueDate.getMonth() + i);
    schedule.push({ installment: i, dueDate, amount: loan.monthlyEmi, paid: false });
  }
  loan.schedule = schedule;
  loan.outstanding = loan.totalPayable;
  loan.status = "disbursed";
  loan.disbursedAt = new Date();
  loan.account = account._id;
  await loan.save();

  await audit(req.user, "loan.disburse", loan.reference, { amount: loan.amount });
  await notify(loan.applicant, "Loan disbursed", `$${loan.amount.toLocaleString()} has been credited to your account.`, "success");
  res.json({ success: true, message: "Loan disbursed", loan, balance: account.balance });
});
