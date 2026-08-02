import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { allLoans, reviewLoan, decideLoan, disburseLoan } from "../controllers/loanFlowController.js";
import { allTickets, assignTicket, updateTicketStatus, replyTicket } from "../controllers/ticketController.js";
import { customerLookup } from "../controllers/adminController.js";
import {
  allDeposits, sendDepositDetails, confirmDeposit, rejectDeposit,
  allWithdrawals, approveWithdrawal, rejectWithdrawal,
} from "../controllers/moneyController.js";

const router = express.Router();
router.use(protect, authorize("employee", "admin"));

// Loans queue
router.get("/loans", allLoans);
router.patch("/loans/:id/review", reviewLoan);
router.patch("/loans/:id/decision", decideLoan);
router.post("/loans/:id/disburse", authorize("admin"), disburseLoan); // disbursement is admin-only

// Deposit requests
router.get("/deposits", allDeposits);
router.post("/deposits/:id/details", sendDepositDetails);
router.post("/deposits/:id/confirm", confirmDeposit);
router.post("/deposits/:id/reject", rejectDeposit);

// Withdrawal requests
router.get("/withdrawals", allWithdrawals);
router.post("/withdrawals/:id/approve", approveWithdrawal);
router.post("/withdrawals/:id/reject", rejectWithdrawal);

// Tickets
router.get("/tickets", allTickets);
router.patch("/tickets/:id/assign", assignTicket);
router.patch("/tickets/:id/status", updateTicketStatus);
router.post("/tickets/:id/reply", replyTicket);

// Customer lookup
router.get("/customers", customerLookup);

export default router;
