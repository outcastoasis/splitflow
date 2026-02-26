// backend/routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const Debt = require("../models/Debt");

// Zahlung eintragen
router.post("/", async (req, res) => {
  const { debtId, amount, date } = req.body;
  const numericAmount = Number(amount);

  if (!debtId || !Number.isFinite(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: "Ungültige Angaben" });
  }

  try {
    // Originalschuld zuerst prüfen, damit keine verwaisten Zahlungen entstehen
    const debt = await Debt.findById(debtId);
    if (!debt) {
      return res.status(404).json({ error: "Schuld nicht gefunden." });
    }

    if (debt.status === "paid") {
      return res.status(400).json({ error: "Schuld ist bereits vollständig bezahlt." });
    }

    const existingPayments = await Payment.find({ debtId });
    const alreadyPaid = existingPayments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = debt.amount - alreadyPaid;

    if (numericAmount > remaining + 0.000001) {
      return res.status(400).json({
        error: `Zahlung zu hoch. Offen sind nur noch ${remaining.toFixed(2)} CHF.`,
      });
    }

    const payment = new Payment({
      debtId,
      from: debt.debtor,
      to: debt.creditor,
      amount: numericAmount,
      date,
    });
    await payment.save();

    const totalPaid = alreadyPaid + numericAmount;
    debt.paidAmount = totalPaid;
    debt.status = totalPaid >= debt.amount ? "paid" : "partial";
    await debt.save();

    res.status(201).json({
      message: "Zahlung erfasst",
      payment,
      debtStatus: debt.status,
      paidAmount: debt.paidAmount,
      remaining: Math.max(0, debt.amount - debt.paidAmount),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Erfassen der Zahlung" });
  }
});

// Zahlung auf Abo-Schulden verteilen
router.post("/abos", async (req, res) => {
  const { debtor, creditor, amount } = req.body;
  const numericAmount = Number(amount);

  if (!debtor || !creditor || !Number.isFinite(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: "Ungültige Angaben" });
  }

  try {
    const debts = await Debt.find({
      debtor,
      creditor,
      isFromSubscription: true,
      status: { $ne: "paid" },
    }).sort({ date: 1 }); // älteste zuerst

    const totalOpen = debts.reduce((sum, debt) => {
      const alreadyPaid = debt.paidAmount || 0;
      const unpaid = Math.max(0, debt.amount - alreadyPaid);
      return sum + unpaid;
    }, 0);

    if (totalOpen <= 0) {
      return res.status(400).json({ error: "Keine offenen Abo-Schulden vorhanden." });
    }

    if (numericAmount > totalOpen + 0.000001) {
      return res.status(400).json({
        error: `Zahlung zu hoch. Offen sind nur noch ${totalOpen.toFixed(2)} CHF.`,
      });
    }

    let remaining = numericAmount;
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
      totalProcessed: numericAmount - remaining,
      remaining,
      payments: createdPayments,
    });
  } catch (err) {
    console.error("Fehler bei Abo-Zahlung:", err);
    res.status(500).json({ error: "Fehler bei Abo-Zahlung" });
  }
});

module.exports = router;
