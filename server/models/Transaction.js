import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    type: {
      type: String,
      enum: ["deposit", "withdrawal", "transfer-in", "transfer-out", "loan-disbursement", "loan-repayment", "fee"],
      required: true,
    },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    description: { type: String, default: "" },
    counterparty: { type: String, default: "" },
    reference: { type: String, index: true },
    status: { type: String, enum: ["completed", "pending", "failed"], default: "completed" },
    flagged: { type: Boolean, default: false },
    flagReason: { type: String, default: "" },
  },
  { timestamps: true }
);

transactionSchema.pre("validate", function (next) {
  if (!this.reference) {
    this.reference = "TXN-" + Math.random().toString(36).slice(2, 10).toUpperCase();
  }
  next();
});

export default mongoose.model("Transaction", transactionSchema);
