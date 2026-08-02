import mongoose from "mongoose";

const loanApplicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    loanType: {
      type: String,
      enum: [
        "Micro Business Loan",
        "Small Business Loan",
        "Credit-Builder Loan",
        "Personal Loan",
        "Auto Loan",
        "Lending Circle Loan",
      ],
      required: true,
    },
    amount: { type: Number, required: true, min: 100 },
    termMonths: { type: Number, required: true, min: 1 },
    interestRate: { type: Number, required: true, min: 0 },
    monthlyEmi: { type: Number, default: 0 },
    totalPayable: { type: Number, default: 0 },
    purpose: { type: String, required: true, trim: true },
    employmentStatus: {
      type: String,
      enum: ["Self-employed", "Employed", "Small Business Owner", "Gig Worker", "Other"],
      default: "Self-employed",
    },
    monthlyIncome: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "under-review", "approved", "rejected"],
      default: "pending",
    },
    reference: { type: String, unique: true },
  },
  { timestamps: true }
);

loanApplicationSchema.pre("validate", function (next) {
  if (!this.reference) {
    this.reference =
      "NUT-LN-" + Math.random().toString(36).slice(2, 7).toUpperCase();
  }
  next();
});

const LoanApplication = mongoose.model(
  "LoanApplication",
  loanApplicationSchema
);
export default LoanApplication;
