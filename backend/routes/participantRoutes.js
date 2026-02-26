// backend/routes/participantRoutes.js
const express = require("express");
const router = express.Router();
const Participant = require("../models/Participant");

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET: Alle Teilnehmer eines Users
router.get("/", async (req, res) => {
  const user = req.query.user; // z. B. ?user=Jascha
  try {
    const participants = await Participant.find({ createdBy: user });
    res.json(participants);
  } catch (err) {
    res.status(500).json({ error: "Fehler beim Abrufen der Teilnehmer" });
  }
});

// POST: Teilnehmer hinzufügen
router.post("/", async (req, res) => {
  const { name, createdBy } = req.body;
  try {
    // Prüfen ob schon vorhanden (Case-insensitive)
    const exists = await Participant.findOne({
      createdBy,
      name: { $regex: new RegExp("^" + escapeRegExp(name) + "$", "i") },
    });
    if (exists) {
      return res
        .status(400)
        .json({ error: "Ein Teilnehmer mit diesem Namen existiert bereits." });
    }

    const newParticipant = new Participant({ name, createdBy });
    const saved = await newParticipant.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: "Teilnehmer konnte nicht erstellt werden" });
  }
});

// DELETE: Teilnehmer löschen
router.delete("/:id", async (req, res) => {
  try {
    await Participant.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Teilnehmer konnte nicht gelöscht werden" });
  }
});

// PUT: Teilnehmernamen ändern + überall übernehmen
router.put("/:id", async (req, res) => {
  const { newName } = req.body;
  try {
    const participant = await Participant.findById(req.params.id);
    if (!participant) {
      return res.status(404).json({ error: "Teilnehmer nicht gefunden" });
    }

    // Prüfen ob neuer Name schon existiert (außer man selbst)
    const exists = await Participant.findOne({
      createdBy: participant.createdBy,
      _id: { $ne: participant._id },
      name: { $regex: new RegExp("^" + escapeRegExp(newName) + "$", "i") },
    });
    if (exists) {
      return res
        .status(400)
        .json({ error: "Ein Teilnehmer mit diesem Namen existiert bereits." });
    }

    const oldName = participant.name;
    participant.name = newName;
    await participant.save();

    const Debt = require("../models/Debt");
    await Debt.updateMany(
      { creditor: oldName },
      { $set: { creditor: newName } }
    );
    await Debt.updateMany({ debtor: oldName }, { $set: { debtor: newName } });

    const Subscription = require("../models/Subscription");
    await Subscription.updateMany(
      { "participants.name": oldName },
      { $set: { "participants.$[elem].name": newName } },
      { arrayFilters: [{ "elem.name": oldName }] }
    );

    res.json({ success: true, message: "Teilnehmername aktualisiert" });
  } catch (err) {
    console.error("Fehler beim Aktualisieren:", err);
    res.status(500).json({ error: "Fehler beim Aktualisieren des Namens" });
  }
});

module.exports = router;
