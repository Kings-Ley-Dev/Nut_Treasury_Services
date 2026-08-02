import mongoose from "mongoose";

const scheduleItemSchema = new mongoose.Schema(
  {
    installment: Number,
    dueDate: Date,
    amount: Number,
    paid: { type: Boolean, default: false },
    paidAt: Date,
  },
  { _id: false }
);

const loanSchema = new mongoose.Schema(
  {
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    reference: { type: String, index: true },
    loanType: {
      type: String,
      enum: ["Micro Business Loan", "Small Business Loan", "Credit-Builder Loan", "Personal Loan", "Auto Loan", "Lending Circle Loan"],
      required: true,
    },
    amount: { type: Number, required: true },
    termMonths: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    purpose: { type: String, default: "" },
    employmentStatus: { type: String, default: "" },
    monthlyIncome: { type: Number, default: 0 },
    monthlyEmi: Number,
    totalPayable: Number,
    totalInterest: Number,
    outstanding: { type: Number, default: 0 },
    // Risk assessment
    riskScore: { type: Number, default: 0 },
    riskBand: { type: String, enum: ["Low", "Medium", "High", ""], default: "" },
    riskNotes: [String],
    // Lifecycle
    status: {
      type: String,
      enum: ["pending", "under-review", "approved", "rejected", "disbursed", "repaying", "closed"],
      default: "pending",
      index: true,
    },
    decisionBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    decisionAt: Date,
    disbursedAt: Date,
    schedule: [scheduleItemSchema],
  },
  { timestamps: true }
);

loanSchema.pre("validate", function (next) {
  if (!this.reference) {
    this.reference = "NUT-LN-" + Math.floor(10000 + Math.random() * 89999).toString();
  }
  next();
});

export default mongoose.model("Loan", loanSchema);
