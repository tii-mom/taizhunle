-- Day 1 red packet schema canonicalization
-- Ensures core tables have consistent columns, constraints, defaults and metadata

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helper trigger function to maintain updated_at timestamps
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- Harmonize legacy column names for redpacket_sales
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'redpacket_sales'
      AND column_name = 'base_amount'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'redpacket_sales'
        AND column_name = 'base_tai'
  ) THEN
    ALTER TABLE redpacket_sales RENAME COLUMN base_amount TO base_tai;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'redpacket_sales'
      AND column_name = 'max_amount'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'redpacket_sales'
        AND column_name = 'max_tai'
  ) THEN
    ALTER TABLE redpacket_sales RENAME COLUMN max_amount TO max_tai;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'redpacket_sales'
      AND column_name = 'total_sold_tai'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'redpacket_sales'
        AND column_name = 'sold_tai'
  ) THEN
    ALTER TABLE redpacket_sales RENAME COLUMN total_sold_tai TO sold_tai;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'redpacket_sales'
      AND column_name = 'is_accelerate'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'redpacket_sales'
        AND column_name = 'accelerate'
  ) THEN
    ALTER TABLE redpacket_sales RENAME COLUMN is_accelerate TO accelerate;
  END IF;
END;
$$;

-- Ensure required columns exist with proper types
ALTER TABLE redpacket_sales
  ADD COLUMN IF NOT EXISTS base_tai BIGINT,
  ADD COLUMN IF NOT EXISTS max_tai BIGINT,
  ADD COLUMN IF NOT EXISTS total_tai BIGINT,
  ADD COLUMN IF NOT EXISTS sold_tai BIGINT,
  ADD COLUMN IF NOT EXISTS accelerate BOOLEAN,
  ADD COLUMN IF NOT EXISTS price_adjustment INTEGER,
  ADD COLUMN IF NOT EXISTS price_adjusted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS memo_prefix TEXT,
  ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sale_code TEXT,
  ADD COLUMN IF NOT EXISTS accelerate_rate NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

UPDATE redpacket_sales
SET
  sold_tai = COALESCE(sold_tai, 0),
  accelerate = COALESCE(accelerate, FALSE),
  accelerate_rate = COALESCE(accelerate_rate, boost_rate::NUMERIC(5, 2), normal_rate::NUMERIC(5, 2), 0),
  price_adjustment = COALESCE(price_adjustment, 0),
  memo_prefix = COALESCE(memo_prefix, 'RP'),
  start_at = COALESCE(start_at, created_at, NOW()),
  expires_at = COALESCE(expires_at, start_at + INTERVAL '7 days'),
  total_tai = COALESCE(
    total_tai,
    GREATEST(
      COALESCE(sold_out_threshold::NUMERIC, 0),
      COALESCE(max_tai::NUMERIC, 0),
      COALESCE(base_tai::NUMERIC, 0)
    )
  ),
  sale_code = CASE
    WHEN sale_code IS NULL OR sale_code = '' THEN 'SALE-' || replace(substr(id::text, 1, 8), '-', '')
    ELSE sale_code
  END,
  created_at = COALESCE(created_at, NOW()),
  updated_at = COALESCE(updated_at, NOW());

ALTER TABLE redpacket_sales
  ALTER COLUMN base_tai TYPE BIGINT USING ROUND(base_tai)::BIGINT,
  ALTER COLUMN max_tai TYPE BIGINT USING ROUND(max_tai)::BIGINT,
  ALTER COLUMN total_tai TYPE BIGINT USING ROUND(total_tai)::BIGINT,
  ALTER COLUMN sold_tai TYPE BIGINT USING ROUND(sold_tai)::BIGINT,
  ALTER COLUMN accelerate SET DEFAULT FALSE,
  ALTER COLUMN accelerate SET NOT NULL,
  ALTER COLUMN price_adjustment SET DEFAULT 0,
  ALTER COLUMN price_adjustment SET NOT NULL,
  ALTER COLUMN sale_code SET NOT NULL,
  ALTER COLUMN price_ton SET NOT NULL,
  ALTER COLUMN base_tai SET NOT NULL,
  ALTER COLUMN max_tai SET NOT NULL,
  ALTER COLUMN total_tai SET NOT NULL,
  ALTER COLUMN sold_tai SET NOT NULL,
  ALTER COLUMN sold_out SET DEFAULT FALSE,
  ALTER COLUMN sold_out SET NOT NULL,
  ALTER COLUMN accelerate_rate SET DEFAULT 0,
  ALTER COLUMN accelerate_rate SET NOT NULL,
  ALTER COLUMN start_at SET DEFAULT NOW(),
  ALTER COLUMN start_at SET NOT NULL,
  ALTER COLUMN expires_at SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'redpacket_sales_sale_code_key'
  ) THEN
    ALTER TABLE redpacket_sales
      ADD CONSTRAINT redpacket_sales_sale_code_key UNIQUE (sale_code);
  END IF;
END;
$$;

ALTER TABLE redpacket_sales
  DROP CONSTRAINT IF EXISTS chk_redpacket_sales_price_positive,
  DROP CONSTRAINT IF EXISTS chk_redpacket_sales_base_positive,
  DROP CONSTRAINT IF EXISTS chk_redpacket_sales_total_positive,
  DROP CONSTRAINT IF EXISTS chk_redpacket_sales_max_ge_base,
  DROP CONSTRAINT IF EXISTS chk_redpacket_sales_total_ge_base,
  DROP CONSTRAINT IF EXISTS chk_redpacket_sales_sold_nonnegative,
  DROP CONSTRAINT IF EXISTS chk_redpacket_sales_accelerate_rate_nonnegative;

ALTER TABLE redpacket_sales
  ADD CONSTRAINT chk_redpacket_sales_price_positive CHECK (price_ton > 0),
  ADD CONSTRAINT chk_redpacket_sales_base_positive CHECK (base_tai > 0),
  ADD CONSTRAINT chk_redpacket_sales_total_positive CHECK (total_tai > 0),
  ADD CONSTRAINT chk_redpacket_sales_max_ge_base CHECK (max_tai >= base_tai),
  ADD CONSTRAINT chk_redpacket_sales_total_ge_base CHECK (total_tai >= base_tai),
  ADD CONSTRAINT chk_redpacket_sales_sold_nonnegative CHECK (sold_tai >= 0),
  ADD CONSTRAINT chk_redpacket_sales_accelerate_rate_nonnegative CHECK (accelerate_rate >= 0);

CREATE UNIQUE INDEX IF NOT EXISTS idx_redpacket_sales_sale_code
  ON redpacket_sales (sale_code);

CREATE INDEX IF NOT EXISTS idx_redpacket_sales_active
  ON redpacket_sales (sold_out, expires_at DESC);

CREATE INDEX IF NOT EXISTS idx_redpacket_sales_expires_at
  ON redpacket_sales (expires_at DESC);

COMMENT ON TABLE redpacket_sales IS '红包销售批次配置，包含价格、加速及时间窗口信息';
COMMENT ON COLUMN redpacket_sales.sale_code IS '业务可识别的红包批次编号，唯一值';
COMMENT ON COLUMN redpacket_sales.price_ton IS '批次的 TON 售价（单位 TON）';
COMMENT ON COLUMN redpacket_sales.base_tai IS '该批次基础发放的 TAI 数量';
COMMENT ON COLUMN redpacket_sales.max_tai IS '加速后允许的最大发放 TAI';
COMMENT ON COLUMN redpacket_sales.total_tai IS '该批次可售 TAI 总量';
COMMENT ON COLUMN redpacket_sales.sold_tai IS '当前批次已售出的 TAI';
COMMENT ON COLUMN redpacket_sales.accelerate IS '是否处于加速模式';
COMMENT ON COLUMN redpacket_sales.accelerate_rate IS '加速比例（百分比）';
COMMENT ON COLUMN redpacket_sales.memo_prefix IS '链上交易 memo 前缀';
COMMENT ON COLUMN redpacket_sales.start_at IS '批次开始时间（含时区）';
COMMENT ON COLUMN redpacket_sales.expires_at IS '批次结束时间（含时区）';
COMMENT ON COLUMN redpacket_sales.price_adjustment IS '人工价格调节累计偏移';
COMMENT ON COLUMN redpacket_sales.price_adjusted_at IS '最近一次调价时间';
COMMENT ON COLUMN redpacket_sales.created_at IS '记录创建时间';
COMMENT ON COLUMN redpacket_sales.updated_at IS '记录上次更新时间';

-- ---------------------------------------------------------------------------
-- Red packet purchases table adjustments
-- ---------------------------------------------------------------------------
ALTER TABLE redpacket_purchases
  ADD COLUMN IF NOT EXISTS amount_tai BIGINT,
  ADD COLUMN IF NOT EXISTS tx_hash TEXT,
  ADD COLUMN IF NOT EXISTS ton_amount NUMERIC(18, 6),
  ADD COLUMN IF NOT EXISTS reward_base_tai BIGINT,
  ADD COLUMN IF NOT EXISTS reward_max_tai BIGINT,
  ADD COLUMN IF NOT EXISTS tai_multiplier NUMERIC(8, 4),
  ADD COLUMN IF NOT EXISTS payment_detected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS unsigned_boc TEXT,
  ADD COLUMN IF NOT EXISTS error_reason TEXT,
  ADD COLUMN IF NOT EXISTS customer_wallet TEXT,
  ADD COLUMN IF NOT EXISTS signature TEXT,
  ADD COLUMN IF NOT EXISTS accelerate BOOLEAN,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status TEXT;

UPDATE redpacket_purchases
SET
  ton_amount = COALESCE(ton_amount, price_paid_ton),
  amount_tai = COALESCE(amount_tai, base_amount_tai::BIGINT, remaining_amount::BIGINT, 0),
  reward_base_tai = COALESCE(reward_base_tai, base_amount_tai::BIGINT),
  reward_max_tai = COALESCE(reward_max_tai, max_amount_tai::BIGINT),
  accelerate = COALESCE(accelerate, FALSE),
  tx_hash = COALESCE(tx_hash, payment_tx_hash);

ALTER TABLE redpacket_purchases
  ALTER COLUMN ton_amount TYPE NUMERIC(18, 6) USING ton_amount::NUMERIC(18, 6),
  ALTER COLUMN amount_tai TYPE BIGINT USING ROUND(amount_tai)::BIGINT;

ALTER TABLE redpacket_purchases
  ALTER COLUMN sale_id SET NOT NULL,
  ALTER COLUMN wallet_address SET NOT NULL,
  ALTER COLUMN ton_amount SET NOT NULL,
  ALTER COLUMN ton_amount SET DEFAULT 0,
  ALTER COLUMN amount_tai SET NOT NULL,
  ALTER COLUMN amount_tai SET DEFAULT 0,
  ALTER COLUMN memo SET NOT NULL,
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'pending',
  ALTER COLUMN accelerate SET NOT NULL,
  ALTER COLUMN accelerate SET DEFAULT FALSE,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT NOW();

ALTER TABLE redpacket_purchases
  DROP CONSTRAINT IF EXISTS redpacket_purchases_sale_id_fkey;

ALTER TABLE redpacket_purchases
  ADD CONSTRAINT redpacket_purchases_sale_id_fkey
    FOREIGN KEY (sale_id)
    REFERENCES redpacket_sales (id)
    ON DELETE CASCADE;

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

ALTER TABLE redpacket_purchases
  DROP CONSTRAINT IF EXISTS redpacket_purchases_tx_hash_key;

ALTER TABLE redpacket_purchases
  ADD CONSTRAINT redpacket_purchases_tx_hash_key UNIQUE (tx_hash);

ALTER TABLE redpacket_purchases
  DROP CONSTRAINT IF EXISTS redpacket_purchases_status_check;

ALTER TABLE redpacket_purchases
  ADD CONSTRAINT redpacket_purchases_status_check
    CHECK (status = ANY (ARRAY['pending','processing','confirmed','failed','active','completed','expired']));

ALTER TABLE redpacket_purchases
  DROP CONSTRAINT IF EXISTS chk_redpacket_purchases_ton_amount_nonnegative,
  DROP CONSTRAINT IF EXISTS chk_redpacket_purchases_amount_tai_nonnegative;

ALTER TABLE redpacket_purchases
  ADD CONSTRAINT chk_redpacket_purchases_ton_amount_nonnegative CHECK (ton_amount >= 0),
  ADD CONSTRAINT chk_redpacket_purchases_amount_tai_nonnegative CHECK (amount_tai >= 0);

CREATE INDEX IF NOT EXISTS idx_redpacket_purchases_sale_status
  ON redpacket_purchases (sale_id, status);

CREATE INDEX IF NOT EXISTS idx_redpacket_purchases_wallet
  ON redpacket_purchases (wallet_address);

CREATE INDEX IF NOT EXISTS idx_redpacket_purchases_created_at
  ON redpacket_purchases (created_at DESC);

COMMENT ON TABLE redpacket_purchases IS '红包购买记录，关联用户购买与链上支付信息';
COMMENT ON COLUMN redpacket_purchases.sale_id IS '关联的红包销售批次主键';
COMMENT ON COLUMN redpacket_purchases.wallet_address IS '付款方钱包地址';
COMMENT ON COLUMN redpacket_purchases.customer_wallet IS '业务侧用户归属钱包（可与付款地址不同）';
COMMENT ON COLUMN redpacket_purchases.ton_amount IS '付款金额（TON）';
COMMENT ON COLUMN redpacket_purchases.amount_tai IS '对应获得的 TAI 数量';
COMMENT ON COLUMN redpacket_purchases.reward_base_tai IS '基于红包规则的基础奖励';
COMMENT ON COLUMN redpacket_purchases.reward_max_tai IS '加速后的最大奖励';
COMMENT ON COLUMN redpacket_purchases.tai_multiplier IS '加速倍率（倍数）';
COMMENT ON COLUMN redpacket_purchases.tx_hash IS '链上交易哈希';
COMMENT ON COLUMN redpacket_purchases.memo IS '链上交易 memo（唯一）';
COMMENT ON COLUMN redpacket_purchases.status IS '业务处理状态：支持 pending/processing/confirmed/failed 等状态';
COMMENT ON COLUMN redpacket_purchases.error_reason IS '失败时的错误描述';
COMMENT ON COLUMN redpacket_purchases.accelerate IS '购买是否触发加速';
COMMENT ON COLUMN redpacket_purchases.payment_detected_at IS '检测到付款的时间';
COMMENT ON COLUMN redpacket_purchases.processed_at IS '业务处理完成时间';
COMMENT ON COLUMN redpacket_purchases.expires_at IS '本条购买记录的过期时间';
COMMENT ON COLUMN redpacket_purchases.created_at IS '记录创建时间';
COMMENT ON COLUMN redpacket_purchases.updated_at IS '记录上次更新时间';

-- ---------------------------------------------------------------------------
-- User balances snapshot adjustments (ensures constraints)
-- ---------------------------------------------------------------------------
ALTER TABLE user_balances
  ALTER COLUMN total_tai SET NOT NULL,
  ALTER COLUMN total_tai SET DEFAULT 0,
  ALTER COLUMN available_tai SET NOT NULL,
  ALTER COLUMN available_tai SET DEFAULT 0,
  ALTER COLUMN locked_tai SET NOT NULL,
  ALTER COLUMN locked_tai SET DEFAULT 0,
  ALTER COLUMN total_ton SET NOT NULL,
  ALTER COLUMN total_ton SET DEFAULT 0,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT NOW();

ALTER TABLE user_balances
  DROP CONSTRAINT IF EXISTS chk_user_balances_total_tai_nonnegative,
  DROP CONSTRAINT IF EXISTS chk_user_balances_available_tai_nonnegative,
  DROP CONSTRAINT IF EXISTS chk_user_balances_locked_tai_nonnegative,
  DROP CONSTRAINT IF EXISTS chk_user_balances_total_ton_nonnegative;

ALTER TABLE user_balances
  ADD CONSTRAINT chk_user_balances_total_tai_nonnegative CHECK (total_tai >= 0),
  ADD CONSTRAINT chk_user_balances_available_tai_nonnegative CHECK (available_tai >= 0),
  ADD CONSTRAINT chk_user_balances_locked_tai_nonnegative CHECK (locked_tai >= 0),
  ADD CONSTRAINT chk_user_balances_total_ton_nonnegative CHECK (total_ton >= 0);

COMMENT ON TABLE user_balances IS '用户资产快照，记录 TAI/Ton 总量与锁定情况';
COMMENT ON COLUMN user_balances.wallet_address IS '用户钱包主键';
COMMENT ON COLUMN user_balances.total_tai IS '用户持有的 TAI 总数';
COMMENT ON COLUMN user_balances.available_tai IS '可用的 TAI 数量';
COMMENT ON COLUMN user_balances.locked_tai IS '锁定的 TAI 数量';
COMMENT ON COLUMN user_balances.total_ton IS '账户对应的 TON 数量';
COMMENT ON COLUMN user_balances.created_at IS '记录创建时间';
COMMENT ON COLUMN user_balances.updated_at IS '记录上次更新时间';

-- ---------------------------------------------------------------------------
-- Updated at triggers
-- ---------------------------------------------------------------------------
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
