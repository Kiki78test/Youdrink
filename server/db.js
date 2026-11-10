"use strict";
const { Pool } = require("pg");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL manquant : impossible de démarrer.");
  process.exit(1);
}
const ssl = process.env.PGSSL === "1" || /render\.com|sslmode=require/.test(url) ? { rejectUnauthorized: false } : undefined;
const pool = new Pool({ connectionString: url, ssl, max: 10 });

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE,
  pass_hash   TEXT,
  google_sub  TEXT UNIQUE,
  pseudo      TEXT,
  sex         CHAR(1),
  age         SMALLINT,
  height      SMALLINT,
  weight      SMALLINT,
  cap         REAL NOT NULL DEFAULT 0.8,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS parties (
  code        CHAR(4) PRIMARY KEY,
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS party_members (
  party_code  CHAR(4) REFERENCES parties(code) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at     TIMESTAMPTZ,
  sam         BOOLEAN NOT NULL DEFAULT false,
  fed         BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (party_code, user_id)
);
CREATE TABLE IF NOT EXISTS drinks (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  party_code  CHAR(4) REFERENCES parties(code) ON DELETE SET NULL,
  t           TIMESTAMPTZ NOT NULL,
  label       TEXT NOT NULL,
  ml          REAL NOT NULL,
  abv         REAL NOT NULL,
  fed         BOOLEAN NOT NULL DEFAULT false,
  water       BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS drinks_party ON drinks(party_code) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS drinks_user_t ON drinks(user_id, t);
CREATE TABLE IF NOT EXISTS trophies (
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  party_code  CHAR(4) NOT NULL,
  key         TEXT NOT NULL,
  kind        TEXT NOT NULL,
  title       TEXT NOT NULL,
  t           TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (user_id, party_code, key)
);
`;

async function migrate() {
  // La base peut mettre un moment à accepter les connexions au premier déploiement.
  for (let i = 1; ; i++) {
    try { await pool.query("SELECT 1"); break; }
    catch (e) {
      console.error(`Base injoignable (essai ${i}) : ${e.message}`);
      if (i >= 10) throw e;
      await new Promise(r => setTimeout(r, 3000 * i));
    }
  }
  await pool.query(SCHEMA); // gen_random_uuid() est natif depuis PostgreSQL 13
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false");
}

module.exports = { pool, migrate, q: (text, params) => pool.query(text, params) };
