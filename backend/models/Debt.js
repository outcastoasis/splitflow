// models/Debt.js
const mongoose = require("mongoose");

const debtSchema = new mongoose.Schema({
  creditor: { type: String, required: true }, // z. B. "Jascha"
  debtor: { type: String, required: true }, // z. B. "Lisa"
  amount: { type: Number, required: true },
  description: String,
  date: { type: Date, required: true },
  status: { type: String, enum: ["open", "paid"], default: "open" },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription",
    default: null,
  },
});

module.exports = mongoose.model("Debt", debtSchema);
