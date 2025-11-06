-- odds stream support
create table if not exists public.market_odds_config (
  id bigserial primary key,
  side_cap_ratio numeric,
  other_floor_ratio numeric,
  min_pool_ratio numeric,
  min_absolute_pool numeric,
  impact_fee_coefficient numeric,
  impact_min_pool numeric,
  impact_max_multiplier numeric,
  min_odds numeric,
  max_odds numeric,
  default_odds numeric,
  sse_refetch_fallback_ms integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.odds_sequence (
  id bigserial primary key,
  market_id uuid references public.predictions(id) on delete cascade not null,
  yes_odds numeric not null,
  no_odds numeric not null,
  yes_pool numeric not null,
  no_pool numeric not null,
  total_pool numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists odds_sequence_market_id_idx on public.odds_sequence (market_id, id);
