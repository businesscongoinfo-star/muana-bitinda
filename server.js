require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000"
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false
}));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Serveur de logistique opérationnel",
    date: new Date().toISOString()
  });
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Ressource introuvable"
  });
});

app.use((err, req, res, next) => {
  console.error("Erreur serveur :", err.message);
  res.status(500).json({
    success: false,
    message: "Une erreur interne est survenue"
  });
});

app.listen(PORT, () => {
  console.log(`Plateforme disponible : http://localhost:${PORT}`);
});