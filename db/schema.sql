-- Lottery App PostgreSQL Schema (Neon / any PostgreSQL)
-- Run: cd backend && python scripts/init_db.py

CREATE TABLE IF NOT EXISTS users (
    user_id          SERIAL PRIMARY KEY,
    public_id        VARCHAR(16)  NOT NULL UNIQUE,     -- e.g. LOT000042
    username         VARCHAR(64)  NOT NULL UNIQUE,
    phone            VARCHAR(20)  UNIQUE,              -- optional at signup
    email            VARCHAR(255) UNIQUE,              -- for password recovery
    security_question VARCHAR(255) NOT NULL,           -- for password recovery
    security_answer  VARCHAR(255) NOT NULL,            -- for password recovery
    password         VARCHAR(255) NOT NULL,            -- bcrypt hash
    account_balance  NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (account_balance >= 0), -- Saudi Riyal (SAR)
    is_admin         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lottery_tickets (
    ticket_id        SERIAL PRIMARY KEY,
    user_id          INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    n1               INTEGER NOT NULL CHECK (n1 BETWEEN 0 AND 9),
    n2               INTEGER NOT NULL CHECK (n2 BETWEEN 0 AND 9),
    n3               INTEGER NOT NULL CHECK (n3 BETWEEN 0 AND 9),
    ticket_type      VARCHAR(10) NOT NULL CHECK (ticket_type IN ('straight','rumble')),
    amount_wagered   NUMERIC(12,2) NOT NULL CHECK (amount_wagered > 0), -- SAR wager
    status           VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active','won','lost')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tickets_user      ON lottery_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_numbers   ON lottery_tickets(n1, n2, n3);
CREATE INDEX IF NOT EXISTS idx_tickets_type      ON lottery_tickets(ticket_type);

CREATE TABLE IF NOT EXISTS winners (
    winner_id        SERIAL PRIMARY KEY,
    user_id          INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    ticket_id        INTEGER REFERENCES lottery_tickets(ticket_id) ON DELETE SET NULL,
    w1               INTEGER NOT NULL CHECK (w1 BETWEEN 0 AND 9),
    w2               INTEGER NOT NULL CHECK (w2 BETWEEN 0 AND 9),
    w3               INTEGER NOT NULL CHECK (w3 BETWEEN 0 AND 9),
    ticket_type      VARCHAR(10) NOT NULL CHECK (ticket_type IN ('straight','rumble')),
    prize_amount     NUMERIC(12,2) NOT NULL CHECK (prize_amount >= 0), -- SAR credited to winner
    announced_date   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_winners_numbers ON winners(w1, w2, w3);
CREATE INDEX IF NOT EXISTS idx_winners_type    ON winners(ticket_type);

CREATE TABLE IF NOT EXISTS deposits (
    deposit_id       SERIAL PRIMARY KEY,
    user_id          INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    amount           NUMERIC(12,2) NOT NULL CHECK (amount > 0), -- PKR submitted by user
    screenshot_path  VARCHAR(512) NOT NULL,
    status           VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at      TIMESTAMPTZ,
    reviewed_by      INTEGER REFERENCES users(user_id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);

-- Seed an admin (username: admin / password: admin123) — CHANGE IMMEDIATELY.
-- bcrypt hash for 'admin123' (cost 12):
INSERT INTO users (username, password, is_admin, account_balance, public_id)
VALUES ('admin', '$2b$12$huyPasqVUSibEWMJoWR2vew5MgMhBL5YxFn54.2XfclENpvOCGdEi', TRUE, 0, 'LOT000001')
ON CONFLICT (username) DO NOTHING;

-- Migrate existing databases (safe to re-run):
ALTER TABLE users ADD COLUMN IF NOT EXISTS public_id VARCHAR(16);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS security_question VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS security_answer VARCHAR(255);
UPDATE users SET public_id = 'LOT' || LPAD(user_id::text, 6, '0') WHERE public_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_public_id ON users(public_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;
