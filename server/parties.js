"use strict";
const { WebSocketServer } = require("ws");
const YD = require("../public/engine.js");
const { q } = require("./db");
const { requireUser, userIdFromReq } = require("./auth");

const MIN = 60000;
const ALPHA = "ABCDEFGHJKMNPQRSTUVWXYZ";
const CODE_RE = /^[A-Z]{4}$/;

/* ---------- instantané d'une soirée (calcul côté serveur) ---------- */
async function snapshot(code) {
  const now = Date.now();
  const { rows: mem } = await q(`
    SELECT u.id, u.pseudo, u.sex, u.age, u.height, u.weight, u.cap, m.sam, m.fed, m.joined_at
    FROM party_members m JOIN users u ON u.id = m.user_id
    WHERE m.party_code=$1 AND m.left_at IS NULL ORDER BY m.joined_at`, [code]);
  const { rows: dr } = await q(`
    SELECT id, user_id, t, label, ml, abv, fed, water, deleted_at FROM drinks
    WHERE party_code=$1 ORDER BY t`, [code]);
  const log = [];
  const members = mem.map(m => {
    const drinks = dr.filter(d => d.user_id === m.id && !d.deleted_at)
      .map(d => ({ id: +d.id, t: +d.t, l: d.label, ml: d.ml, abv: d.abv, fed: d.fed, ...(d.water ? { water: 1 } : {}) }));
    dr.filter(d => d.user_id === m.id && d.deleted_at)
      .forEach(d => log.push({ key: "del:" + d.id, pid: m.id, kind: "info", t: +d.deleted_at, title: "Verre supprimé",
        text: `${m.pseudo} a supprimé un verre (${d.label}, noté à ${new Date(+d.t).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" })}).` }));
    const p = { id: m.id, pseudo: m.pseudo, sex: m.sex, age: m.age, height: m.height, weight: m.weight, cap: m.cap, sam: m.sam, joined: +m.joined_at, drinks };
    const { sim, ev, score } = YD.scoreSummary(p, now);
    const pts = sim.pts.filter((x, i) => i % 5 === 0 || Math.abs(x[0] - now) < MIN || i === sim.pts.length - 1)
      .map(([t, b]) => [t, Math.round(b * 1000) / 1000]);
    return { id: m.id, pseudo: m.pseudo, cap: m.cap, sam: m.sam, fed: m.fed, joined: p.joined, drinks,
      sim: { pts, cur: sim.cur, prev: sim.prev, peak: sim.peak, peakT: sim.peakT, zeroT: sim.zeroT, grams: sim.grams }, ev, score };
  });
  persistTrophies(code, members).catch(e => console.error("trophées", e.message));
  return { code, now, members, log };
}

async function persistTrophies(code, members) {
  for (const m of members) for (const e of m.ev) {
    await q(`INSERT INTO trophies(user_id, party_code, key, kind, title, t) VALUES($1,$2,$3,$4,$5,to_timestamp($6/1000.0))
             ON CONFLICT DO NOTHING`, [m.id, code, e.key.split(":")[1], e.kind, e.title, e.t]);
  }
}

/* ---------- temps réel ---------- */
const rooms = new Map(); // code -> Set(ws)
async function broadcast(code) {
  const set = rooms.get(code);
  if (!set || !set.size) return;
  const msg = JSON.stringify({ type: "party", data: await snapshot(code) });
  for (const ws of set) if (ws.readyState === 1) ws.send(msg);
}
setInterval(() => { for (const code of rooms.keys()) broadcast(code).catch(e => console.error("diffusion", e.message)); }, MIN);

function attachWs(server) {
  const wss = new WebSocketServer({ noServer: true });
  server.on("upgrade", async (req, socket, head) => {
    try {
      const url = new URL(req.url, "http://x");
      if (url.pathname !== "/ws") return socket.destroy();
      const code = String(url.searchParams.get("code") || "").toUpperCase();
      const uid = userIdFromReq(req);
      if (!uid || !CODE_RE.test(code)) return socket.destroy();
      const { rows } = await q("SELECT 1 FROM party_members WHERE party_code=$1 AND user_id=$2 AND left_at IS NULL", [code, uid]);
      if (!rows[0]) return socket.destroy();
      wss.handleUpgrade(req, socket, head, ws => {
        if (!rooms.has(code)) rooms.set(code, new Set());
        rooms.get(code).add(ws);
        ws.isAlive = true;
        ws.on("pong", () => { ws.isAlive = true; });
        ws.on("close", () => { const s = rooms.get(code); if (s) { s.delete(ws); if (!s.size) rooms.delete(code); } });
        snapshot(code).then(d => ws.send(JSON.stringify({ type: "party", data: d }))).catch(() => {});
      });
    } catch (e) { socket.destroy(); }
  });
  setInterval(() => wss.clients.forEach(ws => { if (!ws.isAlive) return ws.terminate(); ws.isAlive = false; ws.ping(); }), 30000);
}

/* ---------- routes ---------- */
async function member(req, res) {
  const code = String(req.params.code || "").toUpperCase();
  if (!CODE_RE.test(code)) { res.status(400).json({ error: "Le code de soirée fait 4 lettres." }); return null; }
  const { rows } = await q("SELECT sam, fed FROM party_members WHERE party_code=$1 AND user_id=$2 AND left_at IS NULL", [code, req.user.id]);
  if (!rows[0]) { res.status(403).json({ error: "Vous ne faites pas partie de cette soirée." }); return null; }
  return { code, ...rows[0] };
}
const profileReady = u => u.pseudo && u.age >= 18 && u.height && u.weight;

async function joinParty(uid, code) {
  await q(`UPDATE party_members SET left_at=now() WHERE user_id=$1 AND left_at IS NULL AND party_code<>$2`, [uid, code]);
  await q(`INSERT INTO party_members(party_code, user_id) VALUES($1,$2)
           ON CONFLICT (party_code, user_id) DO UPDATE SET left_at=NULL`, [code, uid]);
  await q("UPDATE parties SET last_activity=now() WHERE code=$1", [code]);
}

function routes(app) {
  app.get("/api/parties/current", requireUser, async (req, res) => {
    const { rows } = await q(`SELECT party_code FROM party_members WHERE user_id=$1 AND left_at IS NULL ORDER BY joined_at DESC LIMIT 1`, [req.user.id]);
    res.json({ code: rows[0] ? rows[0].party_code : null });
  });

  app.post("/api/parties", requireUser, async (req, res) => {
    if (!profileReady(req.user)) return res.status(400).json({ error: "Complétez d'abord votre profil." });
    for (let i = 0; i < 20; i++) {
      const code = Array.from({ length: 4 }, () => ALPHA[Math.floor(Math.random() * ALPHA.length)]).join("");
      const r = await q("INSERT INTO parties(code, created_by) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING code", [code, req.user.id]);
      if (r.rows[0]) { await joinParty(req.user.id, code); return res.json({ code }); }
    }
    res.status(503).json({ error: "Impossible de créer une soirée pour le moment. Réessayez." });
  });

  app.post("/api/parties/:code/join", requireUser, async (req, res) => {
    if (!profileReady(req.user)) return res.status(400).json({ error: "Complétez d'abord votre profil." });
    const code = String(req.params.code || "").toUpperCase();
    if (!CODE_RE.test(code)) return res.status(400).json({ error: "Le code de soirée fait 4 lettres." });
    const { rows } = await q("SELECT code FROM parties WHERE code=$1", [code]);
    if (!rows[0]) return res.status(404).json({ error: "Aucune soirée avec ce code. Vérifiez les 4 lettres." });
    await joinParty(req.user.id, code);
    res.json({ code });
    broadcast(code).catch(() => {});
  });

  app.post("/api/parties/:code/leave", requireUser, async (req, res) => {
    const m = await member(req, res); if (!m) return;
    await q("UPDATE party_members SET left_at=now() WHERE party_code=$1 AND user_id=$2", [m.code, req.user.id]);
    res.json({ ok: true });
    broadcast(m.code).catch(() => {});
  });

  app.get("/api/parties/:code", requireUser, async (req, res) => {
    const m = await member(req, res); if (!m) return;
    res.json(await snapshot(m.code));
  });

  app.put("/api/parties/:code/me", requireUser, async (req, res) => {
    const m = await member(req, res); if (!m) return;
    const sam = req.body.sam === undefined ? m.sam : !!req.body.sam;
    const fed = req.body.fed === undefined ? m.fed : !!req.body.fed;
    if (sam && !m.sam) {
      const { rows } = await q("SELECT 1 FROM drinks WHERE party_code=$1 AND user_id=$2 AND abv>0 AND deleted_at IS NULL LIMIT 1", [m.code, req.user.id]);
      if (rows[0]) return res.status(400).json({ error: "Vous avez déjà bu de l'alcool ce soir : impossible d'être Sam." });
    }
    await q("UPDATE party_members SET sam=$3, fed=$4 WHERE party_code=$1 AND user_id=$2", [m.code, req.user.id, sam, fed]);
    res.json({ ok: true });
    broadcast(m.code).catch(() => {});
  });

  app.post("/api/parties/:code/drinks", requireUser, async (req, res) => {
    const m = await member(req, res); if (!m) return;
    const b = req.body || {};
    const ml = +b.ml, abv = +b.abv, ago = Math.round(+b.agoMin || 0);
    const water = abv === 0;
    const label = String(b.label || (water ? "Eau" : "Verre perso")).slice(0, 30);
    if (!(ml >= 10 && ml <= 1000)) return res.status(400).json({ error: "Indiquez un volume entre 1 et 100 cl." });
    if (!(abv >= 0 && abv <= 80)) return res.status(400).json({ error: "Indiquez un degré entre 0 et 80 %." });
    if (!(ago >= 0 && ago <= 180)) return res.status(400).json({ error: "Un verre peut être noté jusqu'à 3 h après coup." });
    if (m.sam && !water) return res.status(400).json({ error: "Vous êtes Sam ce soir : seulement des boissons sans alcool." });
    const { rows: recent } = await q(`SELECT count(*)::int AS n FROM drinks WHERE user_id=$1 AND abv>0 AND deleted_at IS NULL
                                       AND created_at > now() - interval '10 minutes'`, [req.user.id]);
    if (!water && recent[0].n >= 6) return res.status(429).json({ error: "Six verres d'alcool en dix minutes : ce rythme n'est pas crédible. Patientez un peu." });
    const fed = b.fed === undefined ? m.fed : !!b.fed;
    await q(`INSERT INTO drinks(user_id, party_code, t, label, ml, abv, fed, water) VALUES($1,$2, now() - make_interval(mins => $3), $4,$5,$6,$7,$8)`,
      [req.user.id, m.code, ago, label, ml, abv, fed, water]);
    await q("UPDATE parties SET last_activity=now() WHERE code=$1", [m.code]);
    res.json({ ok: true });
    broadcast(m.code).catch(() => {});
  });

  app.delete("/api/parties/:code/drinks/:id", requireUser, async (req, res) => {
    const m = await member(req, res); if (!m) return;
    const { rows } = await q(`UPDATE drinks SET deleted_at=now() WHERE id=$1 AND user_id=$2 AND party_code=$3 AND deleted_at IS NULL
                              AND created_at > now() - interval '3 hours' RETURNING id`, [+req.params.id, req.user.id, m.code]);
    if (!rows[0]) return res.status(400).json({ error: "Ce verre ne peut plus être supprimé (plus de 3 h)." });
    res.json({ ok: true });
    broadcast(m.code).catch(() => {});
  });

  /* Suivi des 7 derniers jours (verres standard de 10 g d'alcool pur) */
  app.get("/api/me/week", requireUser, async (req, res) => {
    const { rows } = await q(`
      SELECT to_char(t AT TIME ZONE 'Europe/Paris', 'YYYY-MM-DD') AS day, sum(ml*abv/100*0.789)/10 AS std
      FROM drinks WHERE user_id=$1 AND deleted_at IS NULL AND abv>0 AND t > now() - interval '7 days'
      GROUP BY 1 ORDER BY 1`, [req.user.id]);
    res.json({ days: rows.map(r => ({ day: r.day, std: Math.round(r.std * 10) / 10 })) });
  });
}

module.exports = { routes, attachWs };
