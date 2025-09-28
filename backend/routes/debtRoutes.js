// routes/debtRoutes.js
const express = require("express");
const router = express.Router();
const Debt = require("../models/Debt");

// GET /api/debts?user=Jascha
const Payment = require("../models/Payment");

router.get("/", async (req, res) => {
  const user = req.query.user;
  try {
    const debts = await Debt.find({
      $or: [{ creditor: user }, { debtor: user }],
    });

    // Für jede Schuld auch Zahlungen holen
    const debtsWithPayments = await Promise.all(
      debts.map(async (debt) => {
        const payments = await Payment.find({ debtId: debt._id });
        const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
        return {
          ...debt.toObject(),
          payments,
          paidAmount,
        };
      })
    );

    res.json(debtsWithPayments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Abrufen der Schulden" });
  }
});

// PATCH /api/debts/:id/pay
router.patch("/:id/pay", async (req, res) => {
  try {
    const updated = await Debt.findByIdAndUpdate(
      req.params.id,
      { status: "paid" },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Fehler beim Aktualisieren der Schuld" });
  }
});

// POST /api/debts
router.post("/", async (req, res) => {
  const { creditor, debtor, amount, description, date } = req.body;

  if (!creditor || !debtor || !amount || !date) {
    return res.status(400).json({ error: "Alle Felder erforderlich" });
  }

  try {
    const newDebt = await Debt.create({
      creditor,
      debtor,
      amount,
      description,
      date,
      subscriptionId: null,
    });

    res.status(201).json(newDebt);
  } catch (err) {
    res.status(500).json({ error: "Fehler beim Erstellen der Schuld" });
  }
});

module.exports = router;
