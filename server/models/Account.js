import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    accountNumber: { type: String, unique: true, index: true },
    type: {
      type: String,
      enum: ["Everyday Savings", "Round-Up Savings", "Certificate of Deposit", "Business Checking", "Joint Savings"],
      default: "Everyday Savings",
    },
    balance: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "USD" },
    status: { type: String, enum: ["pending", "active", "frozen", "closed"], default: "pending" },
  },
  { timestamps: true }
);

// Generate a unique 10-digit account number
accountSchema.pre("validate", function (next) {
  if (!this.accountNumber) {
    this.accountNumber = "NB" + Math.floor(1_000_000_00 + Math.random() * 8_999_999_99).toString();
  }
  next();
});

export default mongoose.model("Account", accountSchema);
