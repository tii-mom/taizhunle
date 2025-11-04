-- DAO Pool Table for v2.0
-- Stores all DAO earnings: creator, jury, invite, platform, reserve

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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_dao_pool_type ON dao_pool(pool_type);
CREATE INDEX IF NOT EXISTS idx_dao_pool_bet_id ON dao_pool(bet_id);
CREATE INDEX IF NOT EXISTS idx_dao_pool_user_id ON dao_pool(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_dao_pool_wallet ON dao_pool(wallet_address) WHERE wallet_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_dao_pool_status ON dao_pool(status);
CREATE INDEX IF NOT EXISTS idx_dao_pool_created_at ON dao_pool(created_at DESC);

-- Composite index for user claims
CREATE INDEX IF NOT EXISTS idx_dao_pool_user_status 
  ON dao_pool(user_id, status) 
  WHERE user_id IS NOT NULL;

-- Comments
COMMENT ON TABLE dao_pool IS 'DAO 收益池，存储所有 DAO 收益：创建、陪审、邀请、平台、储备';
COMMENT ON COLUMN dao_pool.pool_type IS '池子类型：create=创建者, jury=陪审员, invite=邀请者, platform=平台, reserve=储备';
COMMENT ON COLUMN dao_pool.amount IS 'TAI 数量（整数，单位：最小单位）';
COMMENT ON COLUMN dao_pool.bet_id IS '关联的预测市场 ID';
COMMENT ON COLUMN dao_pool.user_id IS '收益归属用户 ID（可为空）';
COMMENT ON COLUMN dao_pool.wallet_address IS '收益归属钱包地址';
COMMENT ON COLUMN dao_pool.status IS '状态：pending=待领取, claimed=已领取, expired=已过期';
COMMENT ON COLUMN dao_pool.claimed_at IS '领取时间';
COMMENT ON COLUMN dao_pool.tx_hash IS '领取交易哈希';

-- Trigger for updated_at
CREATE TRIGGER trg_dao_pool_updated
  BEFORE UPDATE ON dao_pool
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- User DAO stats view (materialized for performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_dao_stats AS
SELECT 
  user_id,
  wallet_address,
  COUNT(*) FILTER (WHERE pool_type = 'create') as create_count,
  COUNT(*) FILTER (WHERE pool_type = 'jury') as jury_count,
  COUNT(*) FILTER (WHERE pool_type = 'invite') as invite_count,
  SUM(amount) FILTER (WHERE status = 'pending') as pending_amount,
  SUM(amount) FILTER (WHERE status = 'claimed') as claimed_amount,
  SUM(amount) as total_amount,
  MAX(created_at) as last_earning_at,
  MAX(claimed_at) as last_claim_at
FROM dao_pool
WHERE user_id IS NOT NULL
GROUP BY user_id, wallet_address;

-- Index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_user_dao_stats_user_id 
  ON mv_user_dao_stats(user_id);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_user_dao_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_dao_stats;
END;
$$ LANGUAGE plpgsql;

-- Comment on view
COMMENT ON MATERIALIZED VIEW mv_user_dao_stats IS '用户 DAO 统计视图（物化，需定期刷新）';
