// routes/subscriptionRoutes.js
const express = require("express");
const router = express.Router();
const Subscription = require("../models/Subscription");
const { createMonthlyDebts } = require("../controllers/subscriptionController");
const Debt = require("../models/Debt");
const dayjs = require("dayjs");

// Alle Abos eines Users abrufen
router.get("/", async (req, res) => {
  const user = req.query.user;
  try {
    const subscriptions = await Subscription.find({
      createdBy: user,
      isDeleted: false,
    });
    res.json(subscriptions);
  } catch (err) {
    res.status(500).json({ error: "Fehler beim Abrufen der Abos" });
  }
});

// Neues Abo erstellen
router.post("/", async (req, res) => {
  const { name, amount, startDate, createdBy, participants } = req.body;
  try {
    // immer Ende nächsten Monats setzen
    const nextDue = dayjs(startDate).add(1, "month").endOf("month").toDate();

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

// Abo endgültig löschen inkl. aller Spuren
router.delete("/:id", async (req, res) => {
  const subscriptionId = req.params.id;

  try {
    // prüfe offene Schulden
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

    // alle Debts + Payments zum Abo löschen
    await Debt.deleteMany({ subscriptionId });
    const Payment = require("../models/Payment");
    await Payment.deleteMany({ debtId: { $in: openDebts.map((d) => d._id) } });

    // Abo selbst löschen
    await Subscription.findByIdAndDelete(subscriptionId);

    res.json({ success: true, message: "Abo und zugehörige Daten gelöscht" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Löschen des Abos" });
  }
});

module.exports = router;
