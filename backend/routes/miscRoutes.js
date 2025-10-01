const express = require("express");
const router = express.Router();

// Minimaler Healthcheck für cron-job.org
router.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

module.exports = router;
