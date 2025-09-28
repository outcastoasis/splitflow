// backend/models/Participant.js
const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdBy: { type: String, required: true }, // z. B. "Jascha"
});

module.exports = mongoose.model("Participant", participantSchema);
