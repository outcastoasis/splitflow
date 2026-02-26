// backend/routes/generateDebts.js
const express = require("express");
const router = express.Router();
const Subscription = require("../models/Subscription");
const Debt = require("../models/Debt");

// Hilfsfunktion zum Monatsdatum (z. B. 2025-09-01)
function getMonthDate(dateString) {
  const date = new Date(dateString);
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// POST /api/generate-debts
router.post("/", async (req, res) => {
  const { user, month } = req.body; // z. B. { user: "Jascha", month: "2025-09-01" }

  if (!user || !month) {
    return res.status(400).json({ error: "user und month erforderlich" });
  }

  const targetMonth = getMonthDate(month);

  try {
    const subscriptions = await Subscription.find({
      createdBy: user,
      isActive: true,
      isPaused: { $ne: true },
      isDeleted: { $ne: true },
    });

    let createdCount = 0;

    for (const sub of subscriptions) {
      for (const participant of sub.participants) {
        // ❌ Keine Schulden an sich selbst erzeugen
        if (participant.name === user) continue;

        const exists = await Debt.findOne({
          subscriptionId: sub._id,
          debtor: participant.name,
          date: targetMonth,
        });

        if (!exists) {
          await Debt.create({
            creditor: user,
            debtor: participant.name,
            amount: participant.share,
            description: `${sub.name} (${targetMonth.toLocaleDateString(
              "de-CH",
              { year: "numeric", month: "long" }
            )})`,
            date: targetMonth,
            subscriptionId: sub._id,
            isFromSubscription: true,
          });
          createdCount++;
        }
      }
    }

    res.json({ message: `${createdCount} Schuldeneinträge erstellt.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Generieren der Schulden" });
  }
});

module.exports = router;
