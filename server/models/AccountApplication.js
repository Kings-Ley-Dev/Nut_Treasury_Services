import mongoose from "mongoose";

const accountApplicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    dateOfBirth: { type: String, default: "" },
    idType: {
      type: String,
      enum: ["Driver's License", "State ID", "Passport", "Social Security Card", "Other"],
      default: "Driver's License",
    },
    idNumber: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    occupation: { type: String, default: "" },
    accountType: {
      type: String,
      enum: [
        "Everyday Savings",
        "Round-Up Savings",
        "Certificate of Deposit",
        "Business Checking",
        "Joint Savings",
      ],
      required: true,
    },
    initialDeposit: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["pending", "under-review", "approved", "rejected"],
      default: "pending",
    },
    reference: { type: String, unique: true },
  },
  { timestamps: true }
);

// Generate a human-friendly reference like NUT-AC-3F8K2
accountApplicationSchema.pre("validate", function (next) {
  if (!this.reference) {
    this.reference =
      "NUT-AC-" + Math.random().toString(36).slice(2, 7).toUpperCase();
  }
  next();
});

const AccountApplication = mongoose.model(
  "AccountApplication",
  accountApplicationSchema
);
export default AccountApplication;
