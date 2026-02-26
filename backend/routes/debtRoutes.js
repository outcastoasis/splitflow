// routes/debtRoutes.js
const express = require("express");
const router = express.Router();
const Debt = require("../models/Debt");

// GET /api/debts?user=Jascha
const Payment = require("../models/Payment");

router.get("/", async (req, res) => {
  const user = req.query.user;
  const subscriptionId = req.query.subscriptionId;

  if (!user && !subscriptionId) {
    return res.status(400).json({ error: "user oder subscriptionId erforderlich" });
  }

  try {
    const query = {};

    if (subscriptionId) {
      query.subscriptionId = subscriptionId;
    }

    if (user) {
      query.$or = [{ creditor: user }, { debtor: user }];
    }

    const debts = await Debt.find(query);

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

  if (creditor === debtor) {
    return res
      .status(400)
      .json({ error: "Man kann sich selbst keine Schuld eintragen." });
  }

  try {
    const newDebt = await Debt.create({
      creditor,
      debtor,
      amount,
      description,
      date,
      subscriptionId: null,
      isFromSubscription: false, // ✅ EINMALIGE SCHULD
    });

    res.status(201).json(newDebt);
  } catch (err) {
    res.status(500).json({ error: "Fehler beim Erstellen der Schuld" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { amount, description, date, creditor, debtor } = req.body;
    const updated = await Debt.findByIdAndUpdate(
      req.params.id,
      { amount, description, date, creditor, debtor },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Aktualisieren der Schuld" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const debt = await Debt.findById(req.params.id);
    res.json(debt);
  } catch (err) {
    res.status(404).json({ error: "Schuld nicht gefunden" });
  }
});

// DELETE /api/debts/:id
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Debt.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Schuld nicht gefunden" });
    }

    // Optional: Auch zugehörige Payments löschen
    await Payment.deleteMany({ debtId: req.params.id });

    res.json({ message: "Schuld erfolgreich gelöscht" });
  } catch (err) {
    console.error("Fehler beim Löschen der Schuld:", err);
    res.status(500).json({ error: "Fehler beim Löschen der Schuld" });
  }
});

module.exports = router;
