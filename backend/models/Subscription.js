const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  startDate: { type: Date, required: true },
  nextDueDate: { type: Date, required: true }, // NEU: für nächste Schulden-Erstellung
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true }, // z. B. "Jascha"
  participants: [
    {
      name: String, // Teilnehmer-Name
      share: Number, // Anteil am Betrag (z. B. 5.00)
    },
  ],
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
