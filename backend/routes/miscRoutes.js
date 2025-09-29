const express = require("express");
const router = express.Router();

// Einfacher Ping-/Healthcheck
router.get("/ping", (req, res) => {
  res.status(200).json({ message: "pong" });
});

module.exports = router;
