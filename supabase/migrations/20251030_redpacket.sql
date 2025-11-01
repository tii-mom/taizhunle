-- Red packet core schema migration
-- Ensures core tables exist with required columns for sales, purchases and balances

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Red packet sales table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS redpacket_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  price_ton NUMERIC(18, 6) NOT NULL,
  base_tai BIGINT NOT NULL,
  max_tai BIGINT NOT NULL,
  total_tai BIGINT NOT NULL,
  sold_tai BIGINT NOT NULL DEFAULT 0,
  sold_out BOOLEAN NOT NULL DEFAULT FALSE,
  accelerate BOOLEAN NOT NULL DEFAULT FALSE,
  price_adjustment INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE redpacket_sales
  ADD COLUMN IF NOT EXISTS sale_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS accelerate_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS memo_prefix TEXT NOT NULL DEFAULT 'RP',
  ADD COLUMN IF NOT EXISTS price_adjusted_at TIMESTAMPTZ;

ALTER TABLE redpacket_sales
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

UPDATE redpacket_sales
  SET expires_at = NOW()
  WHERE expires_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_redpacket_sales_active
  ON redpacket_sales (sold_out, expires_at DESC);

-- ---------------------------------------------------------------------------
-- Red packet purchases table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS redpacket_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES redpacket_sales(id) ON DELETE SET NULL,
  wallet_address TEXT NOT NULL,
  amount_tai BIGINT,
  tx_hash TEXT,
  memo TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE redpacket_purchases
  ADD COLUMN IF NOT EXISTS sale_id UUID;

ALTER TABLE redpacket_purchases
  ADD COLUMN IF NOT EXISTS wallet_address TEXT;

UPDATE redpacket_purchases
  SET wallet_address = COALESCE(wallet_address, 'migration_placeholder_wallet');

ALTER TABLE redpacket_purchases
  ADD COLUMN IF NOT EXISTS memo TEXT;

UPDATE redpacket_purchases
  SET memo = COALESCE(memo, gen_random_uuid()::text);

ALTER TABLE redpacket_purchases
  ADD COLUMN IF NOT EXISTS ton_amount NUMERIC(18, 6),
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reward_base_tai BIGINT,
  ADD COLUMN IF NOT EXISTS reward_max_tai BIGINT,
  ADD COLUMN IF NOT EXISTS payment_detected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS unsigned_boc TEXT,
  ADD COLUMN IF NOT EXISTS accelerate BOOLEAN,
  ADD COLUMN IF NOT EXISTS error_reason TEXT,
  ADD COLUMN IF NOT EXISTS customer_wallet TEXT,
  ADD COLUMN IF NOT EXISTS signature TEXT,
  ADD COLUMN IF NOT EXISTS tai_multiplier NUMERIC(8, 4),
  ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'redpacket_purchases_memo_key'
  ) THEN
    ALTER TABLE redpacket_purchases
      ADD CONSTRAINT redpacket_purchases_memo_key UNIQUE (memo);
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_redpacket_purchases_sale
  ON redpacket_purchases (sale_id, status);

CREATE INDEX IF NOT EXISTS idx_redpacket_purchases_wallet
  ON redpacket_purchases (wallet_address);

-- ---------------------------------------------------------------------------
-- User balances table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_balances (
  wallet_address TEXT PRIMARY KEY,
  total_tai BIGINT NOT NULL DEFAULT 0,
  available_tai BIGINT NOT NULL DEFAULT 0,
  locked_tai BIGINT NOT NULL DEFAULT 0,
  total_ton NUMERIC(18, 6) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_balances_updated
  ON user_balances (updated_at DESC);

-- ---------------------------------------------------------------------------
-- Updated at trigger helper
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_redpacket_sales_updated ON redpacket_sales;

CREATE TRIGGER trg_redpacket_sales_updated
  BEFORE UPDATE ON redpacket_sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_redpacket_purchases_updated ON redpacket_purchases;

CREATE TRIGGER trg_redpacket_purchases_updated
  BEFORE UPDATE ON redpacket_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_user_balances_updated ON user_balances;

CREATE TRIGGER trg_user_balances_updated
  BEFORE UPDATE ON user_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
