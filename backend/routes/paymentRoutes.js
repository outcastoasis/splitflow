// backend/routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const Debt = require("../models/Debt");

// Zahlung eintragen
router.post("/", async (req, res) => {
  const { debtId, from, to, amount, date } = req.body;

  try {
    // Zahlung speichern
    const payment = new Payment({ debtId, from, to, amount, date });
    await payment.save();

    // Zahlungen für diese Schuld abrufen
    const payments = await Payment.find({ debtId });
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    // Originalschuld abrufen
    const debt = await Debt.findById(debtId);

    if (!debt) return res.status(404).json({ error: "Schuld nicht gefunden." });

    // Falls vollständig bezahlt, als "paid" markieren
    if (totalPaid >= debt.amount) {
      debt.status = "paid";
      await debt.save();
    }

    res.status(201).json({ message: "Zahlung erfasst", payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Erfassen der Zahlung" });
  }
});

module.exports = router;
