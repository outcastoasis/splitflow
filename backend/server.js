// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const participantRoutes = require("./routes/participantRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const generateDebtsRoute = require("./routes/generateDebts");
const debtRoutes = require("./routes/debtRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const miscRoutes = require("./routes/miscRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/participants", participantRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/generate-debts", generateDebtsRoute);
app.use("/api/debts", debtRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/", miscRoutes);

// Beispielroute zum Testen
app.get("/", (req, res) => {
  res.send("Abo-Schulden-Manager Backend läuft!");
});

// MongoDB-Verbindung
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Verbunden mit MongoDB Atlas");
    app.listen(PORT, () => {
      console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB-Verbindung fehlgeschlagen:", err);
  });
