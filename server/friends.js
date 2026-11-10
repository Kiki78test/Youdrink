"use strict";
/* Amis : code ami, demandes, et taux en direct des amis qui partagent leur soirée. */
const YD = require("../public/engine.js");
const { q } = require("./db");
const { requireUser } = require("./auth");

const MIN = 60000;
const CODE_ALPHA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const pair = (x, y) => (x < y ? [x, y] : [y, x]);

async function migrate() {
  await q("ALTER TABLE users ADD COLUMN IF NOT EXISTS friend_code TEXT UNIQUE");
  await q("ALTER TABLE users ADD COLUMN IF NOT EXISTS share_friends BOOLEAN NOT NULL DEFAULT true");
  await q(`CREATE TABLE IF NOT EXISTS friendships (
    a UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    b UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    requested_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (a, b))`);
}

async function myCode(uid) {
  const { rows } = await q("SELECT friend_code, share_friends FROM users WHERE id=$1", [uid]);
  if (rows[0] && rows[0].friend_code) return rows[0];
  for (let i = 0; i < 20; i++) {
    const code = Array.from({ length: 6 }, () => CODE_ALPHA[Math.floor(Math.random() * CODE_ALPHA.length)]).join("");
    const r = await q("UPDATE users SET friend_code=$2 WHERE id=$1 AND friend_code IS NULL AND NOT EXISTS (SELECT 1 FROM users WHERE friend_code=$2) RETURNING friend_code, share_friends", [uid, code]);
    if (r.rows[0]) return r.rows[0];
  }
  throw new Error("Code ami impossible à créer.");
}

/* Taux en direct d'un ami : seulement s'il partage et s'il est dans une soirée active (12 h). */
async function live(f) {
  if (!f.share_friends) return null;
  const { rows: pm } = await q(`SELECT m.party_code, m.sam, m.joined_at FROM party_members m JOIN parties p ON p.code=m.party_code
    WHERE m.user_id=$1 AND m.left_at IS NULL AND p.last_activity > now() - interval '12 hours' ORDER BY m.joined_at DESC LIMIT 1`, [f.id]);
  if (!pm[0]) return null;
  const now = Date.now();
  const { rows: dr } = await q("SELECT t, label, ml, abv, water FROM drinks WHERE user_id=$1 AND party_code=$2 AND deleted_at IS NULL ORDER BY t", [f.id, pm[0].party_code]);
  const { rows: ml } = await q("SELECT t, kind FROM meals WHERE user_id=$1 AND t > now() - interval '30 hours'", [f.id]);
  const p = { id: f.id, pseudo: f.pseudo, sex: f.sex, age: f.age, height: f.height, weight: f.weight, cap: f.cap, sam: pm[0].sam, joined: +pm[0].joined_at,
    drinks: dr.map(d => ({ t: +d.t, l: d.label, ml: d.ml, abv: d.abv, ...(d.water ? { water: 1 } : {}) })),
    meals: ml.map(m => ({ t: +m.t, kind: m.kind })) };
  const { sim, ev } = YD.scoreSummary(p, now);
  const last = ev.filter(e => e.kind !== "info").sort((a, b) => b.t - a.t)[0] || null;
  const pts = sim.pts.filter(([t], i) => t >= now - 130 * MIN && t <= now + 65 * MIN && (i % 5 === 0 || Math.abs(t - now) < MIN))
    .map(([t, b]) => [t, Math.round(b * 1000) / 1000]);
  const lastDrink = p.drinks.length ? p.drinks[p.drinks.length - 1] : null;
  return { cur: sim.cur, prev: sim.prev, peak: sim.peak, zeroT: sim.zeroT, pts, sam: p.sam,
    drinks: lastDrink ? [lastDrink] : [], last: last && { title: last.title, kind: last.kind, t: last.t } };
}

function routes(app) {
  app.get("/api/friends", requireUser, async (req, res) => {
    const me = req.user.id, mine = await myCode(me);
    const { rows } = await q(`SELECT f.status, f.requested_by, u.id, u.pseudo, u.sex, u.age, u.height, u.weight, u.cap, u.share_friends
      FROM friendships f JOIN users u ON u.id = CASE WHEN f.a=$1 THEN f.b ELSE f.a END
      WHERE (f.a=$1 OR f.b=$1) ORDER BY u.pseudo`, [me]);
    const friends = [];
    for (const r of rows.filter(r => r.status === "accepted")) friends.push({ id: r.id, pseudo: r.pseudo || "Ami", cap: r.cap, share: r.share_friends, live: await live(r) });
    res.json({
      code: mine.friend_code, share: mine.share_friends, friends,
      incoming: rows.filter(r => r.status === "pending" && r.requested_by !== me).map(r => ({ id: r.id, pseudo: r.pseudo || "Quelqu'un" })),
      outgoing: rows.filter(r => r.status === "pending" && r.requested_by === me).map(r => ({ id: r.id, pseudo: r.pseudo || "Quelqu'un" })),
    });
  });

  app.post("/api/friends", requireUser, async (req, res) => {
    const me = req.user.id, code = String(req.body.code || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (code.length !== 6) return res.status(400).json({ error: "Le code ami fait 6 caractères." });
    const { rows } = await q("SELECT id, pseudo FROM users WHERE friend_code=$1", [code]);
    const o = rows[0];
    if (!o) return res.status(404).json({ error: "Aucun joueur avec ce code. Vérifiez les 6 caractères." });
    if (o.id === me) return res.status(400).json({ error: "C'est votre propre code." });
    const [a, b] = pair(me, o.id);
    const { rows: ex } = await q("SELECT status, requested_by FROM friendships WHERE a=$1 AND b=$2", [a, b]);
    if (ex[0] && ex[0].status === "accepted") return res.json({ ok: true, state: "already", pseudo: o.pseudo });
    if (ex[0] && ex[0].requested_by !== me) {
      await q("UPDATE friendships SET status='accepted' WHERE a=$1 AND b=$2", [a, b]);
      return res.json({ ok: true, state: "accepted", pseudo: o.pseudo });
    }
    if (ex[0]) return res.json({ ok: true, state: "pending", pseudo: o.pseudo });
    const { rows: n } = await q("SELECT count(*)::int AS n FROM friendships WHERE requested_by=$1 AND status='pending'", [me]);
    if (n[0].n >= 30) return res.status(429).json({ error: "Trop de demandes en attente." });
    await q("INSERT INTO friendships(a, b, status, requested_by) VALUES($1,$2,'pending',$3)", [a, b, me]);
    res.json({ ok: true, state: "sent", pseudo: o.pseudo });
  });

  app.post("/api/friends/:id/accept", requireUser, async (req, res) => {
    const [a, b] = pair(req.user.id, String(req.params.id));
    const { rows } = await q("UPDATE friendships SET status='accepted' WHERE a=$1 AND b=$2 AND status='pending' AND requested_by<>$3 RETURNING 1", [a, b, req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: "Demande introuvable." });
    res.json({ ok: true });
  });

  app.delete("/api/friends/:id", requireUser, async (req, res) => {
    const [a, b] = pair(req.user.id, String(req.params.id));
    await q("DELETE FROM friendships WHERE a=$1 AND b=$2", [a, b]);
    res.json({ ok: true });
  });

  app.put("/api/me/share", requireUser, async (req, res) => {
    await q("UPDATE users SET share_friends=$2 WHERE id=$1", [req.user.id, !!req.body.share]);
    res.json({ ok: true });
  });
}

module.exports = { routes, migrate };
