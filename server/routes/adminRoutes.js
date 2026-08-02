import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  listUsers, updateUserStatus, verifyKyc, deleteUser,
  createInvite, listInvites, revokeInvite,
  allTransactions, fraudAlerts, auditLogs, reports,
} from "../controllers/adminController.js";

const router = express.Router();
router.use(protect, authorize("admin"));

router.get("/users", listUsers);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/kyc", verifyKyc);
router.delete("/users/:id", deleteUser);

router.get("/invites", listInvites);
router.post("/invites", createInvite);
router.delete("/invites/:id", revokeInvite);

router.get("/transactions", allTransactions);
router.get("/fraud", fraudAlerts);
router.get("/audit", auditLogs);
router.get("/reports", reports);

export default router;
