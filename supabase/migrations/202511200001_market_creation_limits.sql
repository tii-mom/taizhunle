-- Market creation limits support
-- Adds juror metadata and creation cooldown tracking on users

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS dao_points INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_juror BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_market_created_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS total_markets_created INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_creation_fee_tai BIGINT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_users_last_market_created_at
  ON users (last_market_created_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_users_total_markets_created
  ON users (total_markets_created DESC);

-- Track per-market juror reward contributions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'predictions' AND column_name = 'juror_reward_tai'
  ) THEN
    ALTER TABLE predictions ADD COLUMN juror_reward_tai BIGINT NOT NULL DEFAULT 0;
  END IF;
END;
$$;

COMMENT ON COLUMN predictions.juror_reward_tai IS 'TAI allocated at creation time for juror rewards';

CREATE INDEX IF NOT EXISTS idx_predictions_creator_reward
  ON predictions (creator_id, created_at DESC);
