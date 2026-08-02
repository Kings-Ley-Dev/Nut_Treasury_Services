import AuditLog from "../models/AuditLog.js";
import Notification from "../models/Notification.js";

/** Record an admin/employee action to the audit trail. */
export const audit = async (actor, action, target = "", meta = {}, ip = "") => {
  try {
    await AuditLog.create({
      actor: actor?._id,
      actorName: actor?.name,
      actorRole: actor?.role,
      action,
      target,
      meta,
      ip,
    });
  } catch (_) {
    /* never block the main flow on audit failure */
  }
};

/** Push an in-app notification to a user. */
export const notify = async (userId, title, body = "", type = "info") => {
  try {
    await Notification.create({ user: userId, title, body, type });
  } catch (_) {
    /* ignore */
  }
};

/**
 * Simple, transparent loan risk model.
 * Produces a 0-100 score and a Low/Medium/High band with human-readable notes.
 */
export const assessRisk = ({ amount, monthlyIncome, termMonths, employmentStatus, monthlyEmi }) => {
  let score = 50;
  const notes = [];

  // Debt-to-income (EMI vs monthly income)
  const dti = monthlyIncome > 0 ? monthlyEmi / monthlyIncome : 1;
  if (dti <= 0.2) { score += 25; notes.push("Low debt-to-income ratio"); }
  else if (dti <= 0.4) { score += 10; notes.push("Moderate debt-to-income ratio"); }
  else { score -= 20; notes.push("High debt-to-income ratio"); }

  // Loan size
  if (amount <= 10000) { score += 10; notes.push("Small loan size"); }
  else if (amount >= 100000) { score -= 15; notes.push("Large loan size"); }

  // Term
  if (termMonths > 48) { score -= 10; notes.push("Long repayment term"); }

  // Employment
  if (["Employed", "Small Business Owner"].includes(employmentStatus)) { score += 10; notes.push("Stable employment"); }
  else if (["Gig Worker", "Other"].includes(employmentStatus)) { score -= 5; notes.push("Variable income source"); }

  score = Math.max(1, Math.min(99, Math.round(score)));
  const band = score >= 70 ? "Low" : score >= 45 ? "Medium" : "High";
  return { riskScore: score, riskBand: band, riskNotes: notes };
};

/** Flag a transaction as potentially fraudulent above a configurable threshold. */
export const fraudCheck = (amount) => {
  const threshold = Number(process.env.FRAUD_THRESHOLD || 10000);
  if (amount >= threshold) {
    return { flagged: true, flagReason: `Amount exceeds monitoring threshold ($${threshold.toLocaleString()})` };
  }
  return { flagged: false, flagReason: "" };
};
