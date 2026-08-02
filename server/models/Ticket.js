import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subject: { type: String, required: true },
    category: { type: String, enum: ["General", "Cards", "Loans", "Transfers", "Security"], default: "General" },
    priority: { type: String, enum: ["low", "normal", "high"], default: "normal" },
    status: { type: String, enum: ["open", "in-progress", "resolved"], default: "open", index: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reference: { type: String, index: true },
    messages: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        authorName: String,
        authorRole: String,
        body: String,
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

ticketSchema.pre("validate", function (next) {
  if (!this.reference) {
    this.reference = "TKT-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  }
  next();
});

export default mongoose.model("Ticket", ticketSchema);
