"use strict";
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { q } = require("./db");

const SECRET = process.env.SESSION_SECRET || (() => {
  console.warn("SESSION_SECRET absent : secret temporaire (les sessions sautent au redémarrage).");
  return crypto.randomBytes(32).toString("hex");
})();
const COOKIE = "yd_s";
const MAX_AGE = 60 * 24 * 3600; // 60 jours
const PROD = process.env.NODE_ENV === "production";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";

function sign(uid) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const body = `${uid}.${exp}`;
  const mac = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${mac}`;
}
function verify(tok) {
  if (!tok) return null;
  const parts = tok.split(".");
  if (parts.length !== 3) return null;
  const [uid, exp, mac] = parts;
  const good = crypto.createHmac("sha256", SECRET).update(`${uid}.${exp}`).digest("base64url");
  if (mac.length !== good.length || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(good))) return null;
  if (+exp < Date.now() / 1000) return null;
  return uid;
}
function parseCookies(h) {
  const out = {};
  (h || "").split(";").forEach(c => { const i = c.indexOf("="); if (i > 0) out[c.slice(0, i).trim()] = decodeURIComponent(c.slice(i + 1).trim()); });
  return out;
}
function userIdFromReq(req) { return verify(parseCookies(req.headers.cookie)[COOKIE]); }
function setSession(res, uid) {
  res.setHeader("Set-Cookie", `${COOKIE}=${sign(uid)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}${PROD ? "; Secure" : ""}`);
}
function clearSession(res) {
  res.setHeader("Set-Cookie", `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${PROD ? "; Secure" : ""}`);
}

/* Limiteur simple en mémoire pour les tentatives de connexion */
const hits = new Map();
function limited(key, max = 10, windowMs = 10 * 60 * 1000) {
  const now = Date.now(), h = (hits.get(key) || []).filter(t => now - t < windowMs);
  h.push(now); hits.set(key, h);
  return h.length > max;
}

const PUBLIC_USER = "id, email, pseudo, sex, age, height, weight, cap, (google_sub IS NOT NULL) AS google";

async function requireUser(req, res, next) {
  const uid = userIdFromReq(req);
  if (!uid) return res.status(401).json({ error: "Connectez-vous pour continuer." });
  const { rows } = await q(`SELECT ${PUBLIC_USER} FROM users WHERE id=$1`, [uid]);
  if (!rows[0]) { clearSession(res); return res.status(401).json({ error: "Session expirée, reconnectez-vous." }); }
  req.user = rows[0];
  next();
}

function routes(app) {
  app.get("/api/config", (req, res) => res.json({ googleClientId: GOOGLE_CLIENT_ID }));

  app.post("/api/auth/register", async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const pass = String(req.body.password || "");
    if (limited("reg:" + req.ip, 8)) return res.status(429).json({ error: "Trop d'essais. Réessayez dans quelques minutes." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Adresse e-mail invalide." });
    if (pass.length < 8) return res.status(400).json({ error: "Le mot de passe doit faire au moins 8 caractères." });
    const hash = await bcrypt.hash(pass, 11);
    try {
      const { rows } = await q("INSERT INTO users(email, pass_hash) VALUES($1,$2) RETURNING id", [email, hash]);
      setSession(res, rows[0].id);
      res.json({ ok: true });
    } catch (e) {
      if (e.code === "23505") return res.status(409).json({ error: "Un compte existe déjà avec cette adresse. Connectez-vous." });
      throw e;
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const pass = String(req.body.password || "");
    if (limited("log:" + req.ip, 12) || limited("logm:" + email, 8)) return res.status(429).json({ error: "Trop d'essais. Réessayez dans quelques minutes." });
    const { rows } = await q("SELECT id, pass_hash FROM users WHERE email=$1", [email]);
    const u = rows[0];
    if (!u || !u.pass_hash || !(await bcrypt.compare(pass, u.pass_hash)))
      return res.status(401).json({ error: "E-mail ou mot de passe incorrect." });
    setSession(res, u.id);
    res.json({ ok: true });
  });

  app.post("/api/auth/google", async (req, res) => {
    if (!GOOGLE_CLIENT_ID) return res.status(400).json({ error: "La connexion Google n'est pas encore activée." });
    const cred = String(req.body.credential || "");
    const r = await fetch("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(cred));
    const info = r.ok ? await r.json() : null;
    if (!info || info.aud !== GOOGLE_CLIENT_ID || !info.sub || info.email_verified !== "true")
      return res.status(401).json({ error: "Connexion Google refusée. Réessayez." });
    const email = String(info.email || "").toLowerCase();
    let { rows } = await q("SELECT id FROM users WHERE google_sub=$1", [info.sub]);
    if (!rows[0] && email) {
      ({ rows } = await q("UPDATE users SET google_sub=$1 WHERE email=$2 AND google_sub IS NULL RETURNING id", [info.sub, email]));
    }
    if (!rows[0]) {
      ({ rows } = await q("INSERT INTO users(email, google_sub, pseudo) VALUES($1,$2,$3) RETURNING id",
        [email || null, info.sub, String(info.given_name || "").slice(0, 20) || null]));
    }
    setSession(res, rows[0].id);
    res.json({ ok: true });
  });

  app.post("/api/auth/logout", (req, res) => { clearSession(res); res.json({ ok: true }); });

  app.get("/api/me", requireUser, (req, res) => res.json({ user: req.user }));

  app.put("/api/me", requireUser, async (req, res) => {
    const b = req.body || {};
    const pseudo = String(b.pseudo || "").trim().slice(0, 20);
    const sex = b.sex === "F" ? "F" : "H";
    const age = Math.round(+b.age), height = Math.round(+b.height), weight = Math.round(+b.weight);
    const cap = [0.5, 0.6, 0.8, 1.0].includes(+b.cap) ? +b.cap : 0.8;
    if (!pseudo) return res.status(400).json({ error: "Choisissez un pseudo." });
    if (!(age >= 18 && age <= 99)) return res.status(400).json({ error: "Youdrink est réservé aux 18 ans et plus : indiquez votre âge." });
    if (!(height >= 130 && height <= 220)) return res.status(400).json({ error: "Indiquez une taille entre 130 et 220 cm." });
    if (!(weight >= 35 && weight <= 200)) return res.status(400).json({ error: "Indiquez un poids entre 35 et 200 kg." });
    const { rows } = await q(`UPDATE users SET pseudo=$2, sex=$3, age=$4, height=$5, weight=$6, cap=$7 WHERE id=$1 RETURNING ${PUBLIC_USER}`,
      [req.user.id, pseudo, sex, age, height, weight, cap]);
    res.json({ user: rows[0] });
  });

  app.delete("/api/me", requireUser, async (req, res) => {
    await q("DELETE FROM users WHERE id=$1", [req.user.id]);
    clearSession(res);
    res.json({ ok: true });
  });
}

module.exports = { routes, requireUser, userIdFromReq };
