-- Red Packet Sales Table
CREATE TABLE IF NOT EXISTS redpacket_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  price_ton DECIMAL(10, 2) NOT NULL,
  base_tai BIGINT NOT NULL,
  max_tai BIGINT NOT NULL,
  sold_tai BIGINT DEFAULT 0,
  total_tai BIGINT NOT NULL,
  sold_out BOOLEAN DEFAULT FALSE,
  accelerate BOOLEAN DEFAULT FALSE,
  price_adjustment INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Official Rain Table
CREATE TABLE IF NOT EXISTS official_rain (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount_tai BIGINT NOT NULL,
  total_shares INTEGER NOT NULL,
  remaining_shares INTEGER NOT NULL,
  ticket_price_ton DECIMAL(10, 2) NOT NULL,
  next_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Red Packet Purchases Table
CREATE TABLE IF NOT EXISTS redpacket_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES redpacket_sales(id),
  wallet_address TEXT NOT NULL,
  tg_id BIGINT,
  amount_tai BIGINT NOT NULL,
  tx_hash TEXT,
  memo TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Official Rain Claims Table
CREATE TABLE IF NOT EXISTS official_rain_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rain_id UUID REFERENCES official_rain(id),
  wallet_address TEXT NOT NULL,
  tg_id BIGINT NOT NULL,
  amount_tai BIGINT NOT NULL,
  tx_hash TEXT,
  qualified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Whale Rankings Table
CREATE TABLE IF NOT EXISTS whale_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  amount_tai BIGINT NOT NULL,
  rank INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_redpacket_purchases_wallet ON redpacket_purchases(wallet_address);
CREATE INDEX IF NOT EXISTS idx_redpacket_purchases_tg_id ON redpacket_purchases(tg_id);
CREATE INDEX IF NOT EXISTS idx_official_rain_claims_wallet ON official_rain_claims(wallet_address);
CREATE INDEX IF NOT EXISTS idx_official_rain_claims_tg_id ON official_rain_claims(tg_id);
CREATE INDEX IF NOT EXISTS idx_whale_rankings_rank ON whale_rankings(rank);

-- Row Level Security
ALTER TABLE redpacket_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_rain ENABLE ROW LEVEL SECURITY;
ALTER TABLE redpacket_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_rain_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE whale_rankings ENABLE ROW LEVEL SECURITY;

-- Policies (allow read for all, write for authenticated)
CREATE POLICY "Allow read access to all" ON redpacket_sales FOR SELECT USING (true);
CREATE POLICY "Allow read access to all" ON official_rain FOR SELECT USING (true);
CREATE POLICY "Allow read access to all" ON whale_rankings FOR SELECT USING (true);

CREATE POLICY "Allow users to view their purchases" ON redpacket_purchases 
  FOR SELECT USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet');

CREATE POLICY "Allow users to view their claims" ON official_rain_claims 
  FOR SELECT USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet');

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_redpacket_sales_updated_at
  BEFORE UPDATE ON redpacket_sales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_official_rain_updated_at
  BEFORE UPDATE ON official_rain
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_redpacket_purchases_updated_at
  BEFORE UPDATE ON redpacket_purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_official_rain_claims_updated_at
  BEFORE UPDATE ON official_rain_claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_whale_rankings_updated_at
  BEFORE UPDATE ON whale_rankings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
