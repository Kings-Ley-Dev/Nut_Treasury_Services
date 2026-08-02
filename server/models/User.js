import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add your full name"],
      trim: true,
      maxlength: [80, "Name cannot exceed 80 characters"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please add a valid email address"],
    },
    phone: { type: String, trim: true, default: "" },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["customer", "employee", "admin"],
      default: "customer",
    },
    // Account lifecycle: pending -> approved / rejected; suspended by admin
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    // KYC / identity verification
    kyc: {
      status: {
        type: String,
        enum: ["not-submitted", "pending", "verified", "rejected"],
        default: "not-submitted",
      },
      idType: {
        type: String,
        enum: ["Driver's License", "State ID", "Passport", "Social Security Card", "Other", ""],
        default: "",
      },
      idNumber: { type: String, default: "" },
      dateOfBirth: { type: String, default: "" },
      residency: {
        type: String,
        enum: ["US Citizen", "Permanent Resident", "Foreign National", ""],
        default: "",
      },
      taxIdType: { type: String, enum: ["SSN", "ITIN", ""], default: "" },
      address: { type: String, default: "" },
      submittedAt: Date,
      reviewedAt: Date,
    },
    // Employee-specific
    department: { type: String, default: "" },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastLogin: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
