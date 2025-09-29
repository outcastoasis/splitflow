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

// Zahlung auf Abo-Schulden verteilen
router.post("/abos", async (req, res) => {
  const { debtor, creditor, amount } = req.body;

  if (!debtor || !creditor || !amount || amount <= 0) {
    return res.status(400).json({ error: "Ungültige Angaben" });
  }

  try {
    const debts = await Debt.find({
      debtor,
      creditor,
      isFromSubscription: true,
      status: { $ne: "paid" },
    }).sort({ date: 1 }); // älteste zuerst

    let remaining = amount;
    const createdPayments = [];

    for (const debt of debts) {
      if (remaining <= 0) break;

      const alreadyPaid = debt.paidAmount || 0;
      const unpaid = debt.amount - alreadyPaid;

      let paymentAmount = 0;

      if (remaining >= unpaid) {
        // Ganze Schuld begleichen
        debt.paidAmount = debt.amount;
        debt.status = "paid";
        paymentAmount = unpaid;
        remaining -= unpaid;
      } else {
        // Teilzahlung
        debt.paidAmount = alreadyPaid + remaining;
        debt.status = "partial";
        paymentAmount = remaining;
        remaining = 0;
      }

      const payment = new Payment({
        debtId: debt._id,
        from: debtor,
        to: creditor,
        amount: paymentAmount,
      });

      await payment.save();
      await debt.save();
      createdPayments.push(payment);
    }

    res.json({
      message: "Abo-Zahlung verarbeitet",
      totalProcessed: amount - remaining,
      remaining,
      payments: createdPayments,
    });
  } catch (err) {
    console.error("Fehler bei Abo-Zahlung:", err);
    res.status(500).json({ error: "Fehler bei Abo-Zahlung" });
  }
});

module.exports = router;
