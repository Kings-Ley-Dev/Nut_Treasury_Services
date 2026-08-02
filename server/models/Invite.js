import mongoose from "mongoose";
import crypto from "crypto";

const inviteSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: ["employee", "admin"], default: "employee" },
    department: { type: String, default: "" },
    token: { type: String, unique: true, index: true },
    used: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

inviteSchema.pre("validate", function (next) {
  if (!this.token) this.token = crypto.randomBytes(24).toString("hex");
  if (!this.expiresAt) this.expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  next();
});

export default mongoose.model("Invite", inviteSchema);
