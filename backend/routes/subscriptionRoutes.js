// routes/subscriptionRoutes.js
const express = require("express");
const router = express.Router();
const Subscription = require("../models/Subscription");
const { createMonthlyDebts } = require("../controllers/subscriptionController");

// Alle Abos eines Users abrufen
router.get("/", async (req, res) => {
  const user = req.query.user;
  try {
    const subscriptions = await Subscription.find({ createdBy: user });
    res.json(subscriptions);
  } catch (err) {
    res.status(500).json({ error: "Fehler beim Abrufen der Abos" });
  }
});

// Neues Abo erstellen
router.post("/", async (req, res) => {
  const { name, amount, startDate, createdBy, participants } = req.body;
  try {
    const nextDue = new Date(startDate);
    nextDue.setMonth(nextDue.getMonth() + 1); // Erste monatliche Buchung nach 1 Monat

    const subscription = new Subscription({
      name,
      amount,
      startDate,
      nextDueDate: nextDue,
      createdBy,
      participants,
    });
    const saved = await subscription.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: "Fehler beim Erstellen des Abos" });
  }
});

router.post("/generate-monthly-debts", createMonthlyDebts);

module.exports = router;
