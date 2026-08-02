import express from "express";
import { protect, authorize, requireApproved } from "../middleware/auth.js";
import {
  myAccounts, overview, myTransactions, transfer,
  listBeneficiaries, addBeneficiary, deleteBeneficiary,
  listCards, issueCard, updateCard,
  listNotifications, markNotification, markAllNotifications,
  changePassword, submitKyc,
} from "../controllers/bankingController.js";
import {
  requestDeposit, myDeposits, confirmDepositPaid,
  requestWithdrawal, myWithdrawals,
} from "../controllers/moneyController.js";
import { applyLoan, myLoans, repayLoan } from "../controllers/loanFlowController.js";
import { createTicket, myTickets, replyTicket } from "../controllers/ticketController.js";

const router = express.Router();
router.use(protect, authorize("customer"));

router.get("/overview", overview);
router.get("/accounts", myAccounts);
router.get("/transactions", myTransactions);
router.post("/transfer", requireApproved, transfer);

// Deposits (request -> bank sends details -> customer pays -> staff confirms)
router.get("/deposits", myDeposits);
router.post("/deposits", requireApproved, requestDeposit);
router.post("/deposits/:id/paid", requireApproved, confirmDepositPaid);

// Withdrawals (request -> staff approves)
router.get("/withdrawals", myWithdrawals);
router.post("/withdrawals", requireApproved, requestWithdrawal);

router.get("/beneficiaries", listBeneficiaries);
router.post("/beneficiaries", requireApproved, addBeneficiary);
router.delete("/beneficiaries/:id", deleteBeneficiary);

router.get("/cards", listCards);
router.post("/cards", requireApproved, issueCard);
router.patch("/cards/:id", updateCard);

router.get("/notifications", listNotifications);
router.patch("/notifications/read-all", markAllNotifications);
router.patch("/notifications/:id", markNotification);

router.post("/security/password", changePassword);
router.post("/kyc", submitKyc);

router.get("/loans", myLoans);
router.post("/loans", requireApproved, applyLoan);
router.post("/loans/:id/repay", requireApproved, repayLoan);

router.get("/tickets", myTickets);
router.post("/tickets", createTicket);
router.post("/tickets/:id/reply", replyTicket);

export default router;
