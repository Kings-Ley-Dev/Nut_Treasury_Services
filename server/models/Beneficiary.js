import mongoose from "mongoose";

const beneficiarySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    nickname: { type: String, default: "" },
    accountNumber: { type: String, required: true },
    bankName: { type: String, default: "Nut Treasury Services" },
    internal: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Beneficiary", beneficiarySchema);
