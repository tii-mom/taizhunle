-- 🐋 Whale Rankings 表
-- ===========================================
-- 目的：
--  - 为鲸鱼榜提供真实的数据存储（钱包地址 + TAI 持仓）
--  - rankingAnalytics.ts 及 whaleService.ts 可直接查询该表
--  - 支持定期批量写入（例如离线任务统计用户资产）

create table if not exists public.whale_rankings (
  wallet_address text primary key,
  amount_tai numeric not null default 0,
  rank integer not null,
  created_at timestamp with time zone default timezone('utc', now()) not null,
  updated_at timestamp with time zone default timezone('utc', now()) not null
);

comment on table public.whale_rankings is '鲸鱼榜快照表，记录每个钱包地址的 TAI 持仓及排行榜顺位';
comment on column public.whale_rankings.wallet_address is '钱包地址（TON，规范化后的 bounceable 地址）';
comment on column public.whale_rankings.amount_tai is 'TAI 持仓（可使用最小单位，统计任务记得统一精度）';
comment on column public.whale_rankings.rank is '当前排行榜名次，1 为榜首';

create index if not exists idx_whale_rankings_rank
  on public.whale_rankings (rank);

create index if not exists idx_whale_rankings_updated_at
  on public.whale_rankings (updated_at desc);

create trigger trg_whale_rankings_updated
  before update on public.whale_rankings
  for each row execute function update_updated_at_column();
