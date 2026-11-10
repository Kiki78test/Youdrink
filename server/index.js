"use strict";
const http = require("http");
const path = require("path");
const express = require("express");
const { migrate } = require("./db");
const auth = require("./auth");
const parties = require("./parties");

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

app.get("/healthz", (req, res) => res.send("ok"));

// Les erreurs des routes async remontent ici (Express 5).
auth.routes(app);
parties.routes(app);
require("./legal").routes(app);

/* Documentation (réservée aux administrateurs) : docs/index.json + PDF */
const DOCS = path.join(__dirname, "..", "docs");
app.get("/api/docs", auth.requireUser, auth.requireAdmin, (req, res) => res.sendFile(path.join(DOCS, "index.json")));
app.use("/docs", auth.requireUser, auth.requireAdmin, express.static(DOCS, { index: false, setHeaders: r => r.setHeader("Cache-Control", "private, no-cache") }));
app.use("/api", (req, res) => res.status(404).json({ error: "Route inconnue." }));

app.use(express.static(path.join(__dirname, "..", "public"), {
  setHeaders(res, p) {
    if (/\.(html|webmanifest)$|sw\.js$/.test(p)) res.setHeader("Cache-Control", "no-cache");
  }
}));
app.get(/^\/(?!api|ws).*/, (req, res) => res.sendFile(path.join(__dirname, "..", "public", "index.html")));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Erreur du serveur. Réessayez dans un instant." });
});

const PORT = process.env.PORT || 3000;
// Le port s'ouvre tout de suite ; la base est préparée en parallèle.
const server = http.createServer(app);
parties.attachWs(server);
server.listen(PORT, () => console.log(`Youdrink en écoute sur le port ${PORT}`));
migrate().then(() => console.log("Base prête."))
  .catch(e => { console.error("Base impossible à préparer :", e.message); process.exit(1); });
