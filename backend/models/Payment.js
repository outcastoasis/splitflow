// backend/models/Payment.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  debtId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Debt",
    required: true,
  },
  from: String, // Zahler
  to: String, // Empfänger
  amount: Number, // Betrag
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Payment", paymentSchema);
