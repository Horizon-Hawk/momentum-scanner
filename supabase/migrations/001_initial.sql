-- Momentum Scanner — initial schema

CREATE TABLE scanner_results (
  ticker         TEXT PRIMARY KEY,
  company_name   TEXT,
  price          NUMERIC(10,4),
  prev_close     NUMERIC(10,4),
  gap_pct        NUMERIC(6,2),
  volume         BIGINT,
  avg_volume     BIGINT,
  rvol           NUMERIC(6,2),
  float_shares   BIGINT,
  high_of_day    NUMERIC(10,4),
  low_of_day     NUMERIC(10,4),
  open_price     NUMERIC(10,4),
  sector         TEXT,
  last_updated   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_filter_presets (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  filters     JSONB NOT NULL,
  is_default  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                 UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT,
  tier                    TEXT DEFAULT 'free',
  status                  TEXT DEFAULT 'active',
  current_period_end      TIMESTAMPTZ,
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE user_filter_presets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own presets" ON user_filter_presets
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own subscription" ON subscriptions
  USING (auth.uid() = user_id);

-- scanner_results: public read, service-role write (backend uses service key)
ALTER TABLE scanner_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON scanner_results FOR SELECT USING (true);

-- Enable Realtime broadcasts for scanner_results
ALTER PUBLICATION supabase_realtime ADD TABLE scanner_results;
