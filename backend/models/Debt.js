// models/Debt.js
const mongoose = require("mongoose");

const debtSchema = new mongoose.Schema({
  creditor: { type: String, required: true }, // z. B. "Jascha"
  debtor: { type: String, required: true }, // z. B. "Lisa"
  amount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 }, // NEU: für Teilzahlungen
  description: String,
  date: { type: Date, required: true },
  month: { type: String }, // NEU: für Abo-Monat (z. B. "2025-09")
  status: {
    type: String,
    enum: ["open", "partial", "paid"], // NEU: "partial" möglich
    default: "open",
  },
  // Abo-Referenz
  isFromSubscription: { type: Boolean, default: false }, // NEU
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription",
    default: null,
  },
});

module.exports = mongoose.model("Debt", debtSchema);
