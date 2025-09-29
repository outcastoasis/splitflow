// routes/subscriptionRoutes.js
const express = require("express");
const router = express.Router();
const Subscription = require("../models/Subscription");
const { createMonthlyDebts } = require("../controllers/subscriptionController");
const Debt = require("../models/Debt");

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

// Einzelnes Abo abrufen
router.get("/:id", async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id);
    res.json(sub);
  } catch (err) {
    res.status(500).json({ error: "Abo nicht gefunden." });
  }
});

// Abo bearbeiten
router.patch("/:id", async (req, res) => {
  try {
    const updated = await Subscription.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name: req.body.name,
          amount: req.body.amount,
          startDate: req.body.startDate,
          isPaused: req.body.isPaused,
          participants: req.body.participants,
        },
      },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Fehler beim Aktualisieren des Abos" });
  }
});

// Abo löschen (Soft Delete)
router.delete("/:id", async (req, res) => {
  const subscriptionId = req.params.id;

  try {
    // Prüfe, ob es noch offene Schulden zu diesem Abo gibt
    const openDebts = await Debt.find({
      subscriptionId,
      status: { $in: ["open", "partial"] },
    });

    if (openDebts.length > 0) {
      return res.status(400).json({
        error:
          "Abo kann nicht gelöscht werden. Es bestehen noch offene Schulden.",
      });
    }

    // Soft-Delete durchführen
    const updated = await Subscription.findByIdAndUpdate(
      subscriptionId,
      { isDeleted: true },
      { new: true }
    );

    res.json({
      success: true,
      message: "Abo wurde gelöscht (sofern vorhanden)",
      updated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Löschen des Abos" });
  }
});

module.exports = router;
