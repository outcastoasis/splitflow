// backend/routes/participantRoutes.js
const express = require("express");
const router = express.Router();
const Participant = require("../models/Participant");

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

module.exports = router;
