const Subscription = require("../models/Subscription");
const Debt = require("../models/Debt");
const dayjs = require("dayjs");

const createMonthlyDebts = async (req, res) => {
  // 🔐 Token aus Header prüfen
  const cronToken = req.headers["x-cron-key"]; // Header-Name frei wählbar
  if (cronToken !== process.env.CRON_SECRET) {
    return res.status(403).json({ error: "Zugriff verweigert" });
  }

  try {
    const today = dayjs();
    const subscriptions = await Subscription.find({ isActive: true });

    let createdDebts = [];

    for (const sub of subscriptions) {
      const due = dayjs(sub.nextDueDate);

      if (due.isBefore(today, "day") || due.isSame(today, "day")) {
        for (const participant of sub.participants) {
          if (participant.name === sub.createdBy) continue;

          const existing = await Debt.findOne({
            debtor: participant.name,
            subscriptionId: sub._id,
            month: due.format("YYYY-MM"),
          });

          if (!existing) {
            const newDebt = new Debt({
              creditor: sub.createdBy,
              debtor: participant.name,
              amount: participant.share,
              description: `${sub.name} – ${due.format("MMMM YYYY")}`,
              date: today.toDate(),
              month: due.format("YYYY-MM"),
              status: "open",
              isFromSubscription: true,
              subscriptionId: sub._id,
            });

            const savedDebt = await newDebt.save();
            createdDebts.push(savedDebt);
          }
        }

        // nextDueDate um 1 Monat erhöhen (Monatsende)
        sub.nextDueDate = due.add(1, "month").endOf("month").toDate();
        await sub.save();
      }
    }

    res.json({
      message: `Neue Schulden erstellt: ${createdDebts.length}`,
      entries: createdDebts,
    });
  } catch (err) {
    console.error("Fehler bei der Abo-Schulden-Erstellung:", err);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
};

module.exports = { createMonthlyDebts };
