import mongoose from "mongoose";

const moneyRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    kind: { type: String, enum: ["deposit", "withdrawal"], required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    note: { type: String, default: "" },

    // Deposit: the bank account details a staff member sends the customer to pay into
    bankDetails: { type: String, default: "" },

    // Withdrawal: where the customer wants the money sent
    destination: { type: String, default: "" },

    // Shared lifecycle.
    // deposit:    requested -> details-sent -> paid -> received  (or rejected)
    // withdrawal: pending   -> approved                          (or rejected)
    status: {
      type: String,
      enum: ["requested", "details-sent", "paid", "received", "pending", "approved", "rejected"],
      default: "requested",
      index: true,
    },
    reference: { type: String, index: true },
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    handledByName: String,
    handledAt: Date,
  },
  { timestamps: true }
);

moneyRequestSchema.pre("validate", function (next) {
  if (!this.reference) {
    const p = this.kind === "deposit" ? "DEP-" : "WDR-";
    this.reference = p + Math.floor(10000 + Math.random() * 89999).toString();
  }
  next();
});

export default mongoose.model("MoneyRequest", moneyRequestSchema);
