-- Consolidated red packet migration
-- Ensures schema reflects post-Day1 adjustments without relying on legacy scripts

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Redpacket sales normalization
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'redpacket_sales' AND column_name = 'memo_prefix'
  ) THEN
    ALTER TABLE redpacket_sales ADD COLUMN memo_prefix TEXT NOT NULL DEFAULT 'RP';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'redpacket_sales' AND column_name = 'start_at'
  ) THEN
    ALTER TABLE redpacket_sales ADD COLUMN start_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END;
$$;

ALTER TABLE redpacket_sales
  ADD COLUMN IF NOT EXISTS accelerate BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS accelerate_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sale_code TEXT,
  ADD COLUMN IF NOT EXISTS price_adjustment INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS price_adjusted_at TIMESTAMPTZ;

UPDATE redpacket_sales
SET sale_code = COALESCE(sale_code, 'SALE-' || replace(substr(id::text, 1, 8), '-', '')),
    start_at = COALESCE(start_at, created_at, NOW()),
    expires_at = COALESCE(expires_at, start_at + INTERVAL '1 day'),
    memo_prefix = COALESCE(memo_prefix, 'RP'),
    accelerate_rate = COALESCE(accelerate_rate, 0),
    accelerate = COALESCE(accelerate, FALSE)
WHERE sale_code IS NULL OR memo_prefix IS NULL OR start_at IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'redpacket_sales_sale_code_key'
  ) THEN
    ALTER TABLE redpacket_sales ADD CONSTRAINT redpacket_sales_sale_code_key UNIQUE (sale_code);
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_redpacket_sales_active
  ON redpacket_sales (sold_out, expires_at DESC);

-- ---------------------------------------------------------------------------
-- Redpacket purchases adjustments
-- ---------------------------------------------------------------------------
ALTER TABLE redpacket_purchases
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS ton_amount NUMERIC(18, 6),
  ADD COLUMN IF NOT EXISTS reward_base_tai BIGINT,
  ADD COLUMN IF NOT EXISTS reward_max_tai BIGINT,
  ADD COLUMN IF NOT EXISTS payment_detected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS unsigned_boc TEXT,
  ADD COLUMN IF NOT EXISTS accelerate BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS error_reason TEXT,
  ADD COLUMN IF NOT EXISTS customer_wallet TEXT,
  ADD COLUMN IF NOT EXISTS tai_multiplier NUMERIC(8, 4),
  ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;

ALTER TABLE redpacket_purchases
  ALTER COLUMN status SET DEFAULT 'pending';

UPDATE redpacket_purchases
SET user_id = COALESCE(user_id, u.id)
FROM users u
WHERE redpacket_purchases.user_id IS NULL
  AND redpacket_purchases.wallet_address = u.wallet_address;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'redpacket_purchases_user_id_fkey'
  ) THEN
    ALTER TABLE redpacket_purchases
      ADD CONSTRAINT redpacket_purchases_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL;
  END IF;
END;
$$;

UPDATE redpacket_purchases
SET memo = COALESCE(memo, 'RP-' || replace(substr(id::text, 1, 13), '-', ''));

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

CREATE INDEX IF NOT EXISTS idx_redpacket_purchases_user_id
  ON redpacket_purchases (user_id);

CREATE INDEX IF NOT EXISTS idx_redpacket_purchases_user_status
  ON redpacket_purchases (user_id, status)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_redpacket_purchases_status_created
  ON redpacket_purchases (status, created_at DESC);

COMMENT ON COLUMN redpacket_purchases.user_id IS '购买用户 ID（关联 users 表，允许 NULL 支持匿名购买）';

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
-- DAO pool safeguards
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dao_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_type TEXT NOT NULL CHECK (pool_type IN ('create', 'jury', 'invite', 'platform', 'reserve')),
  amount BIGINT NOT NULL CHECK (amount >= 0),
  bet_id TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  wallet_address TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'expired')),
  claimed_at TIMESTAMPTZ,
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dao_pool_type ON dao_pool(pool_type);
CREATE INDEX IF NOT EXISTS idx_dao_pool_user_id ON dao_pool(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_dao_pool_status ON dao_pool(status);
CREATE INDEX IF NOT EXISTS idx_dao_pool_created_at ON dao_pool(created_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_dao_pool_updated'
  ) THEN
    CREATE TRIGGER trg_dao_pool_updated
      BEFORE UPDATE ON dao_pool
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- Materialized view helper
-- ---------------------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_dao_stats AS
SELECT 
  user_id,
  wallet_address,
  COUNT(*) FILTER (WHERE pool_type = 'create') AS create_count,
  COUNT(*) FILTER (WHERE pool_type = 'jury') AS jury_count,
  COUNT(*) FILTER (WHERE pool_type = 'invite') AS invite_count,
  SUM(amount) FILTER (WHERE status = 'pending') AS pending_amount,
  SUM(amount) FILTER (WHERE status = 'claimed') AS claimed_amount,
  SUM(amount) AS total_amount,
  MAX(created_at) AS last_earning_at,
  MAX(claimed_at) AS last_claim_at
FROM dao_pool
WHERE user_id IS NOT NULL
GROUP BY user_id, wallet_address;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_user_dao_stats_user_id
  ON mv_user_dao_stats(user_id);

