import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    holderName: { type: String, required: true },
    last4: { type: String, required: true },
    brand: { type: String, default: "Nut Debit" },
    type: { type: String, enum: ["virtual", "physical"], default: "virtual" },
    expiry: { type: String, required: true },
    status: { type: String, enum: ["active", "frozen", "cancelled"], default: "active" },
    dailyLimit: { type: Number, default: 2000 },
  },
  { timestamps: true }
);

export default mongoose.model("Card", cardSchema);
