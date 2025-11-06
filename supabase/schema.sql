-- ===========================================
-- 🚀 Taizhunle (太准了) 数据库 Schema
-- ===========================================

-- 启用必要的扩展
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ===========================================
-- 👥 用户表
-- ===========================================
create table public.users (
  id uuid default uuid_generate_v4() primary key,
  wallet_address text unique not null,
  telegram_id bigint unique,
  telegram_username text,
  first_name text,
  last_name text,
  language_code text default 'zh',
  is_premium boolean default false,
  dao_points integer default 0,
  is_juror boolean default false,
  last_market_created_at timestamp with time zone,
  total_markets_created integer default 0,
  total_creation_fee_tai bigint default 0,

  -- 用户统计
  total_bets numeric default 0,
  total_winnings numeric default 0,
  total_losses numeric default 0,
  win_rate numeric default 0,
  
  -- 状态
  is_active boolean default true,
  is_blacklisted boolean default false,
  last_active_at timestamp with time zone default timezone('utc'::text, now()),
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ===========================================
-- 🎯 预测市场表
-- ===========================================
create table public.predictions (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  creator_id uuid references public.users(id) not null,
  
  -- 时间设置
  end_time timestamp with time zone not null,
  settlement_time timestamp with time zone,
  
  -- 状态管理
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'active', 'ended', 'settled', 'cancelled')),
  result text check (result in ('yes', 'no')),
  
  -- 奖池信息
  base_pool numeric default 1000000, -- 创建者投入的 100万 TAI
  total_pool numeric default 0,
  yes_pool numeric default 0,
  no_pool numeric default 0,
  
  -- 手续费
  total_fees numeric default 0,
  creator_fee numeric default 0,
  platform_fee numeric default 0,
  juror_reward_tai bigint default 0,

  -- 主题标签 & 参考资料
  tags text[] default '{}'::text[],
  reference_url text,

  -- 审核信息
  admin_notes text,
  approved_by uuid references public.users(id),
  approved_at timestamp with time zone,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ===========================================
-- 💰 下注记录表
-- ===========================================
create table public.bets (
  id uuid default uuid_generate_v4() primary key,
  prediction_id uuid references public.predictions(id) not null,
  user_id uuid references public.users(id) not null,
  
  -- 下注信息
  side text not null check (side in ('yes', 'no')),
  amount numeric not null,
  odds numeric not null,
  potential_payout numeric not null,
  
  -- 手续费
  fee_amount numeric not null,
  net_amount numeric not null, -- 扣除手续费后的实际下注金额
  
  -- 邀请奖励
  referrer_id uuid references public.users(id),
  referrer_reward numeric default 0,
  
  -- 状态
  status text default 'pending' check (status in ('pending', 'confirmed', 'won', 'lost', 'refunded')),
  payout_amount numeric default 0,
  
  -- 区块链信息
  tx_hash text,
  block_number bigint,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  settled_at timestamp with time zone
);

-- ===========================================
-- 📈 赔率配置
-- ===========================================
create table public.market_odds_config (
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

-- ===========================================
-- 📊 赔率序列记录
-- ===========================================
create table public.odds_sequence (
  id bigserial primary key,
  market_id uuid references public.predictions(id) on delete cascade not null,
  yes_odds numeric not null,
  no_odds numeric not null,
  yes_pool numeric not null,
  no_pool numeric not null,
  total_pool numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index odds_sequence_market_id_idx on public.odds_sequence (market_id, id);

-- ===========================================
-- 🧧 红包销售表
-- ===========================================
create table public.redpacket_sales (
  id uuid default uuid_generate_v4() primary key,
  
  -- 价格配置
  price_ton numeric not null default 9.99,
  base_amount numeric not null default 10000, -- 立即到账金额
  max_amount numeric not null default 200000, -- 最大裂变金额
  
  -- 裂变系数
  normal_rate numeric not null default 0.05, -- 5%
  boost_rate numeric not null default 0.10,  -- 10%
  is_accelerate boolean default false, -- 是否加速期
  
  -- 售罄控制
  sold_out boolean default false,
  sold_out_threshold numeric default 8000000000, -- 80亿 TAI
  total_sold_tai numeric default 0,
  
  -- 统计
  total_purchases integer default 0,
  total_revenue_ton numeric default 0,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ===========================================
-- 🎁 红包购买记录表
-- ===========================================
create table public.redpacket_purchases (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  
  -- 购买信息
  price_paid_ton numeric not null,
  base_amount_tai numeric not null,
  max_amount_tai numeric not null,
  
  -- 红包信息
  share_code text unique not null,
  current_claimers integer default 0,
  max_claimers integer default 100,
  remaining_amount numeric not null,
  
  -- 状态
  status text default 'active' check (status in ('active', 'completed', 'expired')),
  expires_at timestamp with time zone default (timezone('utc'::text, now()) + interval '7 days'),
  
  -- 区块链信息
  payment_tx_hash text,
  distribution_tx_hash text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ===========================================
-- 🎊 红包领取记录表
-- ===========================================
create table public.redpacket_claims (
  id uuid default uuid_generate_v4() primary key,
  redpacket_id uuid references public.redpacket_purchases(id) not null,
  user_id uuid references public.users(id) not null,
  
  -- 领取信息
  amount_tai numeric not null,
  claim_rate numeric not null, -- 领取时的裂变系数
  
  -- 区块链信息
  tx_hash text,
  block_number bigint,
  
  claimed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(redpacket_id, user_id) -- 每个用户只能领取一次
);

-- ===========================================
-- 🌧️ 官方雨露表
-- ===========================================
create table public.official_rain (
  id uuid default uuid_generate_v4() primary key,
  
  -- 雨露信息
  amount_tai numeric not null default 10000000, -- 1000万 TAI
  ticket_price_ton numeric not null default 0.3,
  min_bonus numeric not null default 5000,
  max_bonus numeric not null default 100000,
  
  -- 参与统计
  total_participants integer default 0,
  max_participants integer default 1000,
  total_distributed numeric default 0,
  
  -- 时间控制
  start_time timestamp with time zone not null,
  end_time timestamp with time zone,
  
  -- 状态
  status text default 'scheduled' check (status in ('scheduled', 'active', 'completed', 'cancelled')),
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ===========================================
-- 💧 官方雨露领取记录表
-- ===========================================
create table public.official_rain_claims (
  id uuid default uuid_generate_v4() primary key,
  rain_id uuid references public.official_rain(id) not null,
  user_id uuid references public.users(id) not null,
  
  -- 资格验证
  has_purchased_redpacket boolean not null, -- 是否买过红包
  has_channel_activity boolean not null,    -- 是否有频道活动
  
  -- 领取信息
  ticket_paid_ton numeric not null,
  amount_received_tai numeric not null,
  bonus_amount numeric not null, -- 随机奖励
  
  -- 区块链信息
  payment_tx_hash text,
  distribution_tx_hash text,
  
  claimed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(rain_id, user_id) -- 每个用户每轮只能参与一次
);

-- ===========================================
-- 🐋 鲸鱼榜快照表
-- ===========================================
create table public.whale_rankings (
  wallet_address text primary key,
  amount_tai numeric not null default 0,
  rank integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.whale_rankings is '鲸鱼榜快照表，记录每个钱包地址的 TAI 持仓及排行榜顺位';
comment on column public.whale_rankings.wallet_address is '钱包地址（TON，规范化后的 bounceable 地址）';
comment on column public.whale_rankings.amount_tai is 'TAI 持仓（最小单位，可由批处理任务写入）';
comment on column public.whale_rankings.rank is '当前名次，1 为榜首';

-- ===========================================
-- 📇 索引创建
-- ===========================================

-- 用户表索引
create index idx_users_wallet_address on public.users(wallet_address);
create index idx_users_telegram_id on public.users(telegram_id);
create index idx_users_is_active on public.users(is_active);

-- 预测表索引
create index idx_predictions_status on public.predictions(status);
create index idx_predictions_creator on public.predictions(creator_id);
create index idx_predictions_end_time on public.predictions(end_time);

-- 下注表索引
create index idx_bets_prediction_id on public.bets(prediction_id);
create index idx_bets_user_id on public.bets(user_id);
create index idx_bets_status on public.bets(status);

-- 红包相关索引
create index idx_redpacket_purchases_user_id on public.redpacket_purchases(user_id);
create index idx_redpacket_purchases_share_code on public.redpacket_purchases(share_code);
create index idx_redpacket_claims_redpacket_id on public.redpacket_claims(redpacket_id);

-- 官方雨露索引
create index idx_official_rain_status on public.official_rain(status);
create index idx_official_rain_start_time on public.official_rain(start_time);

-- 鲸鱼榜索引
create index idx_whale_rankings_rank on public.whale_rankings(rank);
create index idx_whale_rankings_updated_at on public.whale_rankings(updated_at desc);

-- ===========================================
-- 🔐 行级安全策略 (RLS)
-- ===========================================

-- 启用 RLS
alter table public.users enable row level security;
alter table public.predictions enable row level security;
alter table public.bets enable row level security;
alter table public.redpacket_sales enable row level security;
alter table public.redpacket_purchases enable row level security;
alter table public.redpacket_claims enable row level security;
alter table public.official_rain enable row level security;
alter table public.official_rain_claims enable row level security;

-- 基础读取策略
create policy "Allow read access" on public.users for select using (true);
create policy "Allow read access" on public.predictions for select using (true);
create policy "Allow read access" on public.bets for select using (true);
create policy "Allow read access" on public.redpacket_sales for select using (true);
create policy "Allow read access" on public.redpacket_purchases for select using (true);
create policy "Allow read access" on public.redpacket_claims for select using (true);
create policy "Allow read access" on public.official_rain for select using (true);
create policy "Allow read access" on public.official_rain_claims for select using (true);

-- ===========================================
-- 🔄 触发器函数
-- ===========================================

-- 更新 updated_at 字段的函数
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- 添加触发器
create trigger update_users_updated_at before update on public.users
  for each row execute function update_updated_at_column();

create trigger update_predictions_updated_at before update on public.predictions
  for each row execute function update_updated_at_column();

create trigger update_redpacket_sales_updated_at before update on public.redpacket_sales
  for each row execute function update_updated_at_column();

create trigger update_redpacket_purchases_updated_at before update on public.redpacket_purchases
  for each row execute function update_updated_at_column();

create trigger update_official_rain_updated_at before update on public.official_rain
  for each row execute function update_updated_at_column();

create trigger update_whale_rankings_updated_at before update on public.whale_rankings
  for each row execute function update_updated_at_column();

-- ===========================================
-- 📊 初始数据
-- ===========================================

-- 插入默认红包销售配置
insert into public.redpacket_sales (
  price_ton,
  base_amount,
  max_amount,
  normal_rate,
  boost_rate,
  sold_out_threshold
) values (
  0.1, -- 测试价格
  10000,
  200000,
  0.05,
  0.10,
  1000000 -- 测试阈值
);
