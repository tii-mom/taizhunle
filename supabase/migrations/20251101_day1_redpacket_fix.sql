-- Day 1 red packet schema fix
-- 补充缺失的 user_id 字段和相关约束

-- ---------------------------------------------------------------------------
-- 添加 redpacket_purchases.user_id 字段
-- ---------------------------------------------------------------------------
ALTER TABLE redpacket_purchases
  ADD COLUMN IF NOT EXISTS user_id UUID;

-- 如果表中已有数据，尝试从 wallet_address 关联 users 表填充 user_id
UPDATE redpacket_purchases rp
SET user_id = u.id
FROM users u
WHERE rp.wallet_address = u.wallet_address
  AND rp.user_id IS NULL;

-- 添加外键约束（允许 NULL，因为可能有匿名购买）
DO $
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'redpacket_purchases_user_id_fkey'
  ) THEN
    ALTER TABLE redpacket_purchases
      ADD CONSTRAINT redpacket_purchases_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE SET NULL;
  END IF;
END;
$;

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_redpacket_purchases_user_id
  ON redpacket_purchases (user_id);

-- 添加复合索引（用户 + 状态）
CREATE INDEX IF NOT EXISTS idx_redpacket_purchases_user_status
  ON redpacket_purchases (user_id, status)
  WHERE user_id IS NOT NULL;

-- 添加复合索引（状态 + 创建时间）
CREATE INDEX IF NOT EXISTS idx_redpacket_purchases_status_created
  ON redpacket_purchases (status, created_at DESC);

-- 添加注释
COMMENT ON COLUMN redpacket_purchases.user_id IS '购买用户 ID（关联 users 表，允许 NULL 支持匿名购买）';

-- ---------------------------------------------------------------------------
-- 添加 redpacket_purchases.sale_id 字段（如果缺失）
-- ---------------------------------------------------------------------------
ALTER TABLE redpacket_purchases
  ADD COLUMN IF NOT EXISTS sale_id UUID;

-- 如果表中已有数据但 sale_id 为空，可以设置为默认的 sale 记录
-- 这里假设有一个默认的 sale 记录，实际使用时需要根据业务逻辑调整
DO $
DECLARE
  default_sale_id UUID;
BEGIN
  -- 获取第一个 sale 记录作为默认值（如果存在）
  SELECT id INTO default_sale_id
  FROM redpacket_sales
  ORDER BY created_at
  LIMIT 1;

  -- 如果找到默认 sale，更新空的 sale_id
  IF default_sale_id IS NOT NULL THEN
    UPDATE redpacket_purchases
    SET sale_id = default_sale_id
    WHERE sale_id IS NULL;
  END IF;
END;
$;

-- 添加 memo 字段（如果缺失）
ALTER TABLE redpacket_purchases
  ADD COLUMN IF NOT EXISTS memo TEXT;

-- 为没有 memo 的记录生成唯一 memo
UPDATE redpacket_purchases
SET memo = 'RP-' || replace(substr(id::text, 1, 13), '-', '')
WHERE memo IS NULL OR memo = '';

-- 确保 memo 唯一性
DO $
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'redpacket_purchases_memo_key'
  ) THEN
    ALTER TABLE redpacket_purchases
      ADD CONSTRAINT redpacket_purchases_memo_key UNIQUE (memo);
  END IF;
END;
$;

-- ---------------------------------------------------------------------------
-- 验证数据完整性
-- ---------------------------------------------------------------------------

-- 检查是否有 sale_id 为空的记录
DO $
DECLARE
  null_sale_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_sale_count
  FROM redpacket_purchases
  WHERE sale_id IS NULL;

  IF null_sale_count > 0 THEN
    RAISE WARNING 'Found % redpacket_purchases records with NULL sale_id', null_sale_count;
  END IF;
END;
$;

-- 检查是否有 memo 为空的记录
DO $
DECLARE
  null_memo_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_memo_count
  FROM redpacket_purchases
  WHERE memo IS NULL OR memo = '';

  IF null_memo_count > 0 THEN
    RAISE WARNING 'Found % redpacket_purchases records with NULL or empty memo', null_memo_count;
  END IF;
END;
$;
