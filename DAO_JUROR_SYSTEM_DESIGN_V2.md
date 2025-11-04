# 太准了 - 陪审员系统完整设计 V2

## 📋 系统概览

陪审员是太准了预测市场的核心治理角色，负责对有争议的预测结果进行仲裁投票。

---

## 🎯 陪审员等级体系

### 等级划分与每日裁定限制

| 等级 | 积分范围 | 称号 | 每日裁定次数 | 
|------|---------|------|-------------|------|
| 1 | 0-99 | 武林新丁 | 3次 |
| 2 | 100-399 | 风尘奇侠 | 9次 |
| 3 | 400-999 | 地狱判官 | 30次 |
| 4 | 1000+ | 天上天下天地无双 | 无限制 | 

**说明**：
- 每日裁定次数在 UTC 00:00 重置
- 超过每日限制后，不再分配新任务
- 已分配但未完成的任务不受限制影响

---

## 💰 质押与积分系统

### 基础质押要求
- **最低质押**：10,000 TAI
- **质押倍数奖励**：质押越多，单次陪审获得积分越多

### 积分计算规则

#### 基础积分
- **陪审参与**：基础 +1 分
- **创建预测**：不加分
- **邀请好友**：不加分

#### 质押倍数加成
```
质押倍数 = 实际质押 / 基础质押(10,000)
积分加成 = min(质押倍数, 10)

示例：
- 质押 10,000 TAI：倍数 = 1，每次陪审 +1 分
- 质押 50,000 TAI：倍数 = 5，每次陪审 +5 分
- 质押 100,000 TAI：倍数 = 10，每次陪审 +10 分
- 质押 1,000,000 TAI：倍数 = 100，但上限 10，每次陪审 +10 分
```

**单次陪审最高积分**：10 分


---

## 🎲 任务分配机制

### 自动分配规则
- **触发时机**：预测结束时间到达后自动触发
- **分配算法**：基于权重的加权随机抽签
- **权重公式**：`(积分 + 10) × 质押额`

### 任务类型

#### 1. 争议预测
- **触发条件**：双方投票差距 < 10% 或金额差距 < 20%
- **陪审员数量**：根据奖池规模决定

#### 2. 举报预测
- **触发条件**：用户主动举报预测结果
- **陪审员数量**：固定 5 人
- **优先级**：高

#### 3. 超时预测
- **触发条件**：创建者在结束后 24 小时内未设置结果
- **陪审员数量**：固定 3 人
- **优先级**：中

### 陪审员数量规则

根据奖池规模动态分配陪审员数量：

| 奖池规模 | 陪审员数量 | 说明 |
|---------|-----------|------|
| < 10万 TAI | 3人 | 小额预测，快速裁决 |
| 10万 - 100万 TAI | 5人 | 中等预测，标准裁决 |
| 100万 - 1000万 TAI | 7人 | 大额预测，谨慎裁决 |
| > 1000万 TAI | 9人 | 超大预测，严格裁决 |

**特殊情况**：
- 举报预测：固定 5 人
- 超时预测：固定 3 人
- 重大争议：可增加至 11 人


---

## 💎 奖励分配机制

### 奖励来源
- 预测市场手续费的 **1%** 作为陪审员奖励池

### 分配规则

根据奖池规模，陪审员获得不同比例的奖励：

| 奖池规模 | 陪审员数量 | 奖励比例 | 单人奖励计算 |
|---------|-----------|---------|-------------|
| < 10万 TAI | 3人 | 3/5 (60%) | 奖池 × 1% × 60% ÷ 3 |
| 10万 - 100万 TAI | 5人 | 4/7 (57%) | 奖池 × 1% × 57% ÷ 5 |
| 100万 - 1000万 TAI | 7人 | 5/9 (56%) | 奖池 × 1% × 56% ÷ 7 |
| > 1000万 TAI | 9人 | 11/20 (55%) | 奖池 × 1% × 55% ÷ 9 |

**剩余部分**：进入 DAO 储备池

### 奖励计算示例

#### 示例 1：小额预测
```
奖池：50,000 TAI
手续费 1%：500 TAI
陪审员数量：3 人
陪审员奖励：500 × 60% = 300 TAI
单人奖励：300 ÷ 3 = 100 TAI
储备池：500 × 40% = 200 TAI
```

#### 示例 2：大额预测
```
奖池：5,000,000 TAI
手续费 1%：50,000 TAI
陪审员数量：7 人
陪审员奖励：50,000 × 56% = 28,000 TAI
单人奖励：28,000 ÷ 7 = 4,000 TAI
储备池：50,000 × 44% = 22,000 TAI
```

#### 示例 3：超大预测
```
奖池：20,000,000 TAI
手续费 1%：200,000 TAI
陪审员数量：9 人
陪审员奖励：200,000 × 55% = 110,000 TAI
单人奖励：110,000 ÷ 9 = 12,222 TAI
储备池：200,000 × 45% = 90,000 TAI
```


---

## ⚠️ 惩罚机制（用代码战胜人性）

### 1. 恶意投票 🔴
**定义**：明显违背事实、故意误导的投票

**检测方式**：
- 用户申诉（见申诉系统）
- 社区举报
- 官方审核

**惩罚措施**：
- 扣除 **25% 质押金**（销毁）
- 扣除 **100 积分**
- 暂停陪审资格 **30 天**
- 公示违规记录
- 降低信用评分

**示例**：
```
陪审员质押：100,000 TAI
当前积分：250 pts

恶意投票后：
- 质押剩余：75,000 TAI (-25,000)
- 积分剩余：150 pts (-100)
- 等级降低：地狱判官 → 风尘奇侠
- 每日限制：30次 → 9次
```

### 2. 接到任务不参与 🟡
**定义**：被分配任务但在截止时间内未投票

**惩罚措施**：
- 扣除 **20 积分**
- 降低抽签权重 **50%**（持续 14 天）
- 发送警告通知
- 记录不参与次数

**累计惩罚**：
- 1次不参与：-20积分，警告
- 2次不参与：-40积分，降权50%
- 3次不参与：-60积分，暂停7天
- 5次不参与：永久取消资格

### 3. 串通作弊 🔴🔴
**定义**：多个陪审员协同作弊、操纵结果

**检测方式**：
- 投票模式分析（相同IP、相同时间、相同模式）
- 用户申诉
- 官方调查

**惩罚措施**：
- 扣除 **90% 质押金**（销毁）
- **永久取消**陪审资格
- 公示作弊记录
- 列入黑名单
- 冻结所有待领取收益

**示例**：
```
陪审员质押：500,000 TAI
待领取收益：50,000 TAI

串通作弊后：
- 质押剩余：50,000 TAI (-450,000 销毁)
- 待领取收益：0 TAI (冻结)
- 永久禁止再次成为陪审员
- 公示钱包地址和违规记录
```

### 4. 准确率过低 🟠
**定义**：投票准确率长期低于 30%（至少参与20次投票后统计）

**惩罚措施**：
- 发送警告提示
- 降低抽签权重 **30%**（持续 30 天）
- 建议学习陪审规则
- 提供培训材料
- 限制参与高额预测（>100万TAI）

**改善机制**：
- 准确率提升至 50% 以上：解除限制
- 准确率提升至 70% 以上：恢复正常权重
- 准确率提升至 85% 以上：获得信用加成


---

## 🛡️ 用户申诉系统

### 申诉入口
- **位置**：DAO 中心 → 申诉通道
- **可见性**：所有用户可见
- **预测详情页**：显示陪审员信息（钱包地址 + Telegram）

### 申诉流程

#### 1. 发起申诉
```
用户条件：
- 质押 10,000 TAI（申诉保证金）
- 提供申诉材料（必填）
- 选择申诉对象（单个陪审员 或 全体陪审员）

申诉材料：
- 文字说明（必填）
- 截图证据（可选）
- 视频证据（可选）
- 相关链接（可选）
```

#### 2. 官方审核
```
审核时间：7 个工作日内
审核内容：
- 申诉材料完整性
- 证据真实性
- 陪审员投票记录
- 预测规则符合性
```

#### 3. 申诉结果

**申诉成功**：
- 被申诉陪审员：扣除 **100% 质押金**
- 质押金分配：全部给予申诉用户
- 陪审员处罚：永久取消资格 + 公示
- 申诉保证金：全额返还

**申诉失败**：
- 申诉保证金 10,000 TAI：分配给被申诉陪审员
- 如果申诉全体陪审员：平均分配给所有陪审员
- 申诉记录：保留但不公示


### 申诉对象选择

#### 申诉单个陪审员
```
适用场景：
- 明确某个陪审员恶意投票
- 有针对性的证据

惩罚对象：
- 仅该陪审员

赔偿金额：
- 该陪审员的全部质押金
```

#### 申诉全体陪审员
```
适用场景：
- 认为整个陪审团集体作弊
- 结果明显不合理

惩罚对象：
- 该预测的所有陪审员

赔偿金额：
- 所有陪审员的质押金总和
```

### 申诉保护机制

**防止恶意申诉**：
- 申诉需要质押 10,000 TAI
- 申诉失败会损失保证金
- 频繁申诉失败会被限制

**保护陪审员**：
- 申诉需要充分证据
- 官方严格审核
- 恶意申诉会被惩罚

**申诉记录**：
- 成功申诉：公示陪审员违规记录
- 失败申诉：不公示，但记录在案
- 用户申诉历史：可查询


---

## 🎨 DAO 界面设计 V2

### 主页布局

```
┌─────────────────────────────────────────────────────────┐
│  DAO 陪审中心                          [申诉通道] [设置]  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  陪审员状态卡片                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  🗡️🌪️ 风尘奇侠 (Lv.2)                          │   │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │   │
│  │  156 / 400 pts  (距离下一等级还需 244 pts)       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────┬──────────┬──────────┬──────────┐         │
│  │ 质押金额  │ 当前积分  │ 投票准确率│ 今日剩余  │         │
│  │ 50,000   │ 156 pts  │ 87.5%    │ 5/9      │         │
│  │ TAI      │          │ 🟢       │          │         │
│  └──────────┴──────────┴──────────┴──────────┘         │
│                                                          │
│  抽签权重: 8,300,000 = (156 + 10) × 50,000             │
│  单次陪审积分: +5 分 (质押倍数 5x)                       │
│                                                          │
│  [追加质押] [申请退出]                                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  待处理任务 (3)                    [筛选] [查看全部]     │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 🔴 紧急 · 举报预测                                 │  │
│  │ #12345 - "2024年比特币能否突破10万美元"            │  │
│  │                                                    │  │
│  │ 奖池: 5,000,000 TAI | 陪审员: 7人                 │  │
│  │ 预估奖励: ~4,000 TAI | 积分: +5                   │  │
│  │ 剩余时间: ⏰ 8小时                                 │  │
│  │                                                    │  │
│  │ [查看详情] [立即投票]                              │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 🟡 标准 · 争议预测                                 │  │
│  │ #12344 - "特斯拉Q4销量预测"                        │  │
│  │                                                    │  │
│  │ 奖池: 800,000 TAI | 陪审员: 5人                   │  │
│  │ 预估奖励: ~2,280 TAI | 积分: +5                   │  │
│  │ 剩余时间: ⏰ 36小时                                │  │
│  │                                                    │  │
│  │ [查看详情] [立即投票]                              │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```


### 申诉通道界面

```
┌─────────────────────────────────────────────────────────┐
│  申诉通道                                        [返回]   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  发起申诉                                                │
│                                                          │
│  申诉保证金: 10,000 TAI                                 │
│  你的余额: 25,000 TAI ✅                                │
│                                                          │
│  选择预测:                                               │
│  [搜索预测 ID 或标题]                                    │
│                                                          │
│  申诉对象:                                               │
│  ○ 单个陪审员                                           │
│  ○ 全体陪审员                                           │
│                                                          │
│  申诉理由: *                                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [文本框 - 详细说明申诉理由]                      │   │
│  │                                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  上传证据:                                               │
│  [📎 上传截图] [📎 上传视频] [🔗 添加链接]              │
│                                                          │
│  已上传: screenshot1.png, video1.mp4                    │
│                                                          │
│  ⚠️ 注意事项:                                           │
│  • 申诉需要充分证据                                      │
│  • 申诉失败将损失 10,000 TAI 保证金                     │
│  • 恶意申诉会被限制使用                                  │
│  • 官方将在 7 个工作日内审核                             │
│                                                          │
│  [取消] [提交申诉]                                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  我的申诉记录                              [筛选]         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ ✅ #APP-001 - 审核通过                             │  │
│  │ 预测: #12340 | 对象: 陪审员 0x1234...              │  │
│  │ 赔偿: 50,000 TAI | 时间: 2024-11-01               │  │
│  │ [查看详情]                                         │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ ⏳ #APP-002 - 审核中                               │  │
│  │ 预测: #12345 | 对象: 全体陪审员                    │  │
│  │ 提交时间: 2024-11-03 | 剩余: 5 天                 │  │
│  │ [查看详情]                                         │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```


### 预测详情页 - 陪审员信息展示

```
┌─────────────────────────────────────────────────────────┐
│  预测详情 - #12345                                       │
└─────────────────────────────────────────────────────────┘

[预测基本信息...]

┌─────────────────────────────────────────────────────────┐
│  陪审团信息 (7人)                          [申诉此预测]  │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 陪审员 #1                                          │  │
│  │ 钱包: 0x1234...5678 [复制]                         │  │
│  │ Telegram: @juror_001 [联系]                        │  │
│  │ 投票: 选项 A | 积分: 256 pts | 准确率: 89%        │  │
│  │ [申诉此陪审员]                                     │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 陪审员 #2                                          │  │
│  │ 钱包: 0x8765...4321 [复制]                         │  │
│  │ Telegram: @juror_002 [联系]                        │  │
│  │ 投票: 选项 A | 积分: 189 pts | 准确率: 85%        │  │
│  │ [申诉此陪审员]                                     │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  [展开查看全部陪审员]                                    │
│                                                          │
│  投票结果: 选项 A (5票) vs 选项 B (2票)                 │
│  最终裁决: 选项 A 胜出                                   │
└─────────────────────────────────────────────────────────┘
```


---

## 📊 数据库设计 V2

### 更新 jurors 表

```sql
CREATE TABLE jurors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  wallet_address TEXT NOT NULL,
  telegram_handle TEXT, -- 新增：Telegram 用户名
  staked_amount BIGINT NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1, -- 1-4 等级
  total_votes INTEGER NOT NULL DEFAULT 0,
  correct_votes INTEGER NOT NULL DEFAULT 0,
  accuracy DECIMAL(5,2) DEFAULT 0,
  daily_votes_used INTEGER DEFAULT 0, -- 今日已用裁定次数
  daily_votes_limit INTEGER DEFAULT 3, -- 今日裁定上限
  last_vote_date DATE, -- 最后投票日期（用于重置计数）
  status TEXT NOT NULL DEFAULT 'active', -- active, unlocking, inactive, banned
  unlock_date TIMESTAMP,
  penalty_count INTEGER DEFAULT 0, -- 惩罚次数
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_jurors_user_id ON jurors(user_id);
CREATE INDEX idx_jurors_status ON jurors(status);
CREATE INDEX idx_jurors_level ON jurors(level);
CREATE INDEX idx_jurors_points ON jurors(points DESC);
CREATE INDEX idx_jurors_daily_votes ON jurors(daily_votes_used, last_vote_date);
```

### 新增 appeals 表（申诉系统）

```sql
CREATE TABLE appeals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appeal_id TEXT UNIQUE NOT NULL, -- APP-001, APP-002...
  user_id UUID NOT NULL REFERENCES users(id),
  market_id UUID NOT NULL REFERENCES markets(id),
  target_type TEXT NOT NULL, -- single, all
  target_juror_id UUID REFERENCES jurors(id), -- 如果是单个陪审员
  stake_amount BIGINT NOT NULL DEFAULT 10000, -- 申诉保证金
  reason TEXT NOT NULL,
  evidence JSONB, -- 证据材料 {screenshots: [], videos: [], links: []}
  status TEXT NOT NULL DEFAULT 'pending', -- pending, reviewing, approved, rejected
  result TEXT, -- approved, rejected
  result_reason TEXT, -- 审核结果说明
  compensation_amount BIGINT, -- 赔偿金额
  reviewed_by UUID REFERENCES users(id), -- 审核人
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_appeals_user_id ON appeals(user_id);
CREATE INDEX idx_appeals_market_id ON appeals(market_id);
CREATE INDEX idx_appeals_status ON appeals(status);
CREATE INDEX idx_appeals_created_at ON appeals(created_at DESC);
```


### 更新 jury_tasks 表

```sql
CREATE TABLE jury_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  market_id UUID NOT NULL REFERENCES markets(id),
  type TEXT NOT NULL, -- dispute, report, timeout
  priority TEXT NOT NULL DEFAULT 'normal', -- urgent, normal
  pool_size BIGINT NOT NULL, -- 奖池规模
  juror_count INTEGER NOT NULL, -- 需要的陪审员数量
  reward_ratio DECIMAL(5,4) NOT NULL, -- 奖励比例 (如 0.6 表示 60%)
  total_reward BIGINT NOT NULL, -- 总奖励金额
  deadline TIMESTAMP NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- open, voting, completed, expired
  result TEXT, -- A, B, invalid
  votes_a INTEGER DEFAULT 0,
  votes_b INTEGER DEFAULT 0,
  votes_invalid INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_jury_tasks_market_id ON jury_tasks(market_id);
CREATE INDEX idx_jury_tasks_status ON jury_tasks(status);
CREATE INDEX idx_jury_tasks_deadline ON jury_tasks(deadline);
CREATE INDEX idx_jury_tasks_pool_size ON jury_tasks(pool_size);
```

### 更新 jury_assignments 表

```sql
CREATE TABLE jury_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES jury_tasks(id),
  juror_id UUID NOT NULL REFERENCES jurors(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, voted, expired
  vote TEXT, -- A, B, invalid
  vote_reason TEXT,
  voted_at TIMESTAMP,
  is_majority BOOLEAN, -- 是否多数派
  reward BIGINT DEFAULT 0, -- 获得的 TAI 奖励
  points_earned INTEGER DEFAULT 0, -- 获得的积分
  UNIQUE(task_id, juror_id)
);

CREATE INDEX idx_jury_assignments_task_id ON jury_assignments(task_id);
CREATE INDEX idx_jury_assignments_juror_id ON jury_assignments(juror_id);
CREATE INDEX idx_jury_assignments_status ON jury_assignments(status);
CREATE INDEX idx_jury_assignments_voted_at ON jury_assignments(voted_at DESC);
```


---

## 🔧 核心算法实现

### 1. 等级计算函数

```typescript
function getJurorLevel(points: number): {
  level: number;
  name: string;
  emoji: string;
  dailyLimit: number;
} {
  if (points >= 1000) {
    return { level: 4, name: '天上天下天地无双', emoji: '⚡👑', dailyLimit: Infinity };
  }
  if (points >= 400) {
    return { level: 3, name: '地狱判官', emoji: '⚔️👹', dailyLimit: 30 };
  }
  if (points >= 100) {
    return { level: 2, name: '风尘奇侠', emoji: '🗡️🌪️', dailyLimit: 9 };
  }
  return { level: 1, name: '武林新丁', emoji: '🥋', dailyLimit: 3 };
}
```

### 2. 积分计算函数

```typescript
function calculatePointsEarned(stakedAmount: number): number {
  const BASE_STAKE = 10000; // 基础质押 10,000 TAI
  const multiplier = Math.floor(stakedAmount / BASE_STAKE);
  const pointsEarned = Math.min(multiplier, 10); // 上限 10 分
  return pointsEarned;
}

// 示例
calculatePointsEarned(10000);   // 返回 1
calculatePointsEarned(50000);   // 返回 5
calculatePointsEarned(100000);  // 返回 10
calculatePointsEarned(1000000); // 返回 10 (上限)
```

### 3. 抽签权重计算

```typescript
function calculateWeight(points: number, stakedAmount: number): number {
  return (points + 10) * stakedAmount;
}

// 示例
calculateWeight(156, 50000); // 返回 8,300,000
```


### 4. 陪审员数量和奖励比例计算

```typescript
function getJuryConfig(poolSize: number): {
  jurorCount: number;
  rewardRatio: number;
  description: string;
} {
  if (poolSize >= 10000000) {
    // > 1000万
    return {
      jurorCount: 9,
      rewardRatio: 11 / 20, // 55%
      description: '超大预测',
    };
  }
  if (poolSize >= 1000000) {
    // 100万 - 1000万
    return {
      jurorCount: 7,
      rewardRatio: 5 / 9, // 55.56%
      description: '大额预测',
    };
  }
  if (poolSize >= 100000) {
    // 10万 - 100万
    return {
      jurorCount: 5,
      rewardRatio: 4 / 7, // 57.14%
      description: '中等预测',
    };
  }
  // < 10万
  return {
    jurorCount: 3,
    rewardRatio: 3 / 5, // 60%
    description: '小额预测',
  };
}

// 计算单个陪审员奖励
function calculateJurorReward(poolSize: number): number {
  const config = getJuryConfig(poolSize);
  const totalReward = poolSize * 0.01; // 1% 手续费
  const jurorReward = totalReward * config.rewardRatio;
  const perJurorReward = jurorReward / config.jurorCount;
  return Math.floor(perJurorReward);
}

// 示例
calculateJurorReward(50000);     // 返回 100 TAI
calculateJurorReward(5000000);   // 返回 4,000 TAI
calculateJurorReward(20000000);  // 返回 12,222 TAI
```


### 5. 加权随机抽签算法

```typescript
interface JurorCandidate {
  id: string;
  points: number;
  stakedAmount: number;
  dailyVotesUsed: number;
  dailyVotesLimit: number;
}

function selectJurors(
  candidates: JurorCandidate[],
  count: number
): string[] {
  // 过滤掉今日已达上限的陪审员
  const eligible = candidates.filter(
    (c) => c.dailyVotesUsed < c.dailyVotesLimit
  );

  if (eligible.length < count) {
    throw new Error('Not enough eligible jurors');
  }

  // 计算权重
  const weights = eligible.map((c) =>
    calculateWeight(c.points, c.stakedAmount)
  );
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  // 加权随机抽取
  const selected: string[] = [];
  const remaining = [...eligible];
  const remainingWeights = [...weights];

  for (let i = 0; i < count; i++) {
    const random = Math.random() * totalWeight;
    let cumulative = 0;
    let selectedIndex = 0;

    for (let j = 0; j < remainingWeights.length; j++) {
      cumulative += remainingWeights[j];
      if (random <= cumulative) {
        selectedIndex = j;
        break;
      }
    }

    selected.push(remaining[selectedIndex].id);
    remaining.splice(selectedIndex, 1);
    remainingWeights.splice(selectedIndex, 1);
  }

  return selected;
}
```


### 6. 每日限制重置

```typescript
async function resetDailyLimits() {
  const today = new Date().toISOString().split('T')[0];
  
  await db.query(`
    UPDATE jurors
    SET 
      daily_votes_used = 0,
      last_vote_date = $1
    WHERE 
      last_vote_date < $1
      OR last_vote_date IS NULL
  `, [today]);
}

// 在 Cron 任务中每天 UTC 00:00 执行
```

### 7. 投票后更新

```typescript
async function recordVote(
  jurorId: string,
  taskId: string,
  vote: 'A' | 'B' | 'invalid',
  reason?: string
) {
  // 1. 记录投票
  await db.query(`
    UPDATE jury_assignments
    SET 
      status = 'voted',
      vote = $1,
      vote_reason = $2,
      voted_at = NOW()
    WHERE 
      juror_id = $3 
      AND task_id = $4
  `, [vote, reason, jurorId, taskId]);

  // 2. 更新陪审员今日使用次数
  await db.query(`
    UPDATE jurors
    SET 
      daily_votes_used = daily_votes_used + 1,
      last_vote_date = CURRENT_DATE,
      total_votes = total_votes + 1
    WHERE id = $1
  `, [jurorId]);

  // 3. 更新任务投票统计
  const voteColumn = vote === 'A' ? 'votes_a' : 
                     vote === 'B' ? 'votes_b' : 'votes_invalid';
  
  await db.query(`
    UPDATE jury_tasks
    SET ${voteColumn} = ${voteColumn} + 1
    WHERE id = $1
  `, [taskId]);
}
```


---

## 🚀 API 设计 V2

### 申诉相关 API

#### POST /api/appeal/create
创建申诉
```typescript
Request: {
  userId: string;
  marketId: string;
  targetType: 'single' | 'all';
  targetJurorId?: string; // 如果是单个陪审员
  reason: string;
  evidence: {
    screenshots?: string[]; // 图片 URL
    videos?: string[];      // 视频 URL
    links?: string[];       // 相关链接
  };
  txHash: string; // 质押 10,000 TAI 的交易哈希
}

Response: {
  success: boolean;
  appealId: string; // APP-001
  message: string;
}
```

#### GET /api/appeal/list/:userId
获取用户的申诉列表
```typescript
Query: {
  status?: 'pending' | 'reviewing' | 'approved' | 'rejected';
  limit?: number;
  offset?: number;
}

Response: {
  appeals: Appeal[];
  total: number;
}
```

#### GET /api/appeal/:appealId
获取申诉详情
```typescript
Response: {
  appeal: Appeal;
  market: MarketDetails;
  jurors: JurorInfo[]; // 被申诉的陪审员信息
}
```


### 陪审员信息 API

#### GET /api/market/:marketId/jurors
获取预测的陪审员信息
```typescript
Response: {
  jurors: Array<{
    id: string;
    walletAddress: string;
    telegramHandle: string;
    vote: 'A' | 'B' | 'invalid';
    points: number;
    accuracy: number;
    level: number;
    levelName: string;
  }>;
  votingResult: {
    votesA: number;
    votesB: number;
    votesInvalid: number;
    finalResult: 'A' | 'B' | 'invalid';
  };
}
```

#### GET /api/juror/profile/:jurorId
获取陪审员公开信息
```typescript
Response: {
  walletAddress: string;
  telegramHandle: string;
  level: number;
  levelName: string;
  points: number;
  totalVotes: number;
  correctVotes: number;
  accuracy: number;
  joinedAt: string;
  recentVotes: Array<{
    marketId: string;
    marketTitle: string;
    vote: string;
    isMajority: boolean;
    votedAt: string;
  }>;
}
```

---

## 📱 Telegram Bot 通知 V2

### 任务分配通知
```
🎯 新陪审任务

任务 #12345
标题：2024年比特币能否突破10万美元
类型：🔴 举报预测
奖池：5,000,000 TAI

陪审员：7人
预估奖励：~4,000 TAI
积分奖励：+5 pts (质押倍数 5x)
截止时间：48小时后

今日剩余：4/9 次

[查看详情] [立即投票]
```

### 每日限制提醒
```
⚠️ 今日裁定次数即将用完

你今天已完成 8/9 次裁定
还剩 1 次机会

提示：升级到下一等级可获得更多裁定次数
当前：风尘奇侠 (156/400 pts)
下一级：地狱判官 (30次/天)

[查看进度]
```

### 申诉通知（陪审员）
```
⚠️ 你收到了一个申诉

申诉 #APP-001
预测：#12345
申诉人：0x9999...1111
申诉理由：[查看详情]

官方正在审核中，预计 7 个工作日内完成
请保持 Telegram 畅通以便联系

[查看申诉详情]
```

### 申诉结果通知（申诉人）
```
✅ 申诉审核通过

申诉 #APP-001
预测：#12345

审核结果：申诉成功
赔偿金额：50,000 TAI
保证金：10,000 TAI 已返还

总计到账：60,000 TAI

[查看详情]
```

---

## 🎮 实施优先级 V2

### Phase 1: 核心功能（2周）
- [ ] 陪审员等级系统
- [ ] 质押倍数积分计算
- [ ] 每日裁定限制
- [ ] 任务自动分配（基于奖池规模）
- [ ] 奖励比例计算
- [ ] 基础 DAO 界面

### Phase 2: 申诉系统（1周）
- [ ] 申诉通道界面
- [ ] 申诉创建和质押
- [ ] 证据上传功能
- [ ] 申诉审核流程
- [ ] 赔偿金分配
- [ ] 预测详情页显示陪审员信息

### Phase 3: 惩罚机制（1周）
- [ ] 恶意投票检测
- [ ] 长期不参与检测
- [ ] 准确率监控
- [ ] 自动惩罚执行
- [ ] 惩罚记录和公示

### Phase 4: 优化和完善（1周）
- [ ] Telegram Bot 通知
- [ ] 性能优化
- [ ] 移动端适配
- [ ] 数据统计和分析
- [ ] 用户体验优化

---

**文档版本**：v2.0  
**创建时间**：2025-11-03  
**更新时间**：2025-11-03  
**状态**：设计完成，待实施


---

## 🚪 退出机制（防止跑路）

### 主动退出 - 智能到账时间

#### 到账时间判定规则

```typescript
function calculateUnlockTime(juror: Juror): {
  unlockType: 'instant' | 'standard' | 'delayed';
  unlockTime: number; // 小时
  reason: string;
} {
  // 检查1：是否有未完成任务
  if (juror.hasUncompletedTasks) {
    return {
      unlockType: 'delayed',
      unlockTime: 72,
      reason: '有未完成的陪审任务，必须完成后才能提款'
    };
  }
  
  // 检查2：是否有待处理申诉
  if (juror.hasPendingAppeals) {
    return {
      unlockType: 'delayed',
      unlockTime: 72,
      reason: '有待处理的申诉，需等待申诉结果'
    };
  }
  
  // 检查3：最近72小时是否有任务
  const last72HoursTasks = getTasksInLast72Hours(juror.id);
  if (last72HoursTasks.length === 0) {
    return {
      unlockType: 'instant',
      unlockTime: 0,
      reason: '72小时内无任务，可立即到账'
    };
  }
  
  // 检查4：最近任务是否都已完成
  const allCompleted = last72HoursTasks.every(t => t.status === 'completed');
  if (allCompleted) {
    return {
      unlockType: 'standard',
      unlockTime: 24,
      reason: '有已完成任务，24小时冷却期后到账'
    };
  }
  
  return {
    unlockType: 'delayed',
    unlockTime: 72,
    reason: '有进行中的任务，需等待72小时'
  };
}
```


### 三种到账模式详解

#### 模式A：即时到账（0小时）⚡
**触发条件**：
- ✅ 72小时内无任务分配
- ✅ 无未完成任务
- ✅ 无待处理申诉
- ✅ 无违规记录

**流程**：
```
1. 用户点击"申请退出"
2. 系统检查通过
3. 立即解锁质押金
4. 签名交易，质押金到账
5. 陪审员资格取消
```

**适用场景**：
- 长期未接到任务的陪审员
- 想要快速退出的陪审员
- 无任何风险的陪审员

---

#### 模式B：标准到账（24小时）⏰
**触发条件**：
- ✅ 72小时内有任务
- ✅ 所有任务已完成
- ✅ 无待处理申诉
- ✅ 无未完成任务

**流程**：
```
1. 用户点击"申请退出"
2. 进入24小时冷却期
3. 冷却期间：
   - 不再分配新任务
   - 等待可能的申诉
   - 可以领取已获得的奖励
4. 24小时后：
   - 如无申诉：自动解锁
   - 如有申诉：转入延迟模式
5. 质押金到账
```

**适用场景**：
- 刚完成任务的陪审员
- 正常退出的陪审员
- 防止投票后立即跑路

**防跑路机制**：
```
场景：陪审员投票支持错误方，预感会被申诉
行为：立即申请退出

系统保护：
- 24小时冷却期
- 用户可以在此期间发起申诉
- 如果被申诉，质押金冻结
- 必须等待申诉结果
```

---

#### 模式C：延迟到账（72小时）⏳
**触发条件**：
- ❌ 有未完成的任务
- ❌ 有待处理的申诉
- ❌ 有进行中的任务

**流程**：
```
1. 用户点击"申请退出"
2. 系统提示：需要完成所有任务
3. 陪审员完成任务
4. 进入72小时等待期
5. 等待期间：
   - 监控申诉情况
   - 等待任务结果确定
   - 等待可能的争议
6. 72小时后：
   - 检查是否有新申诉
   - 检查是否有惩罚
   - 扣除应扣款项
7. 剩余质押金到账
```

**适用场景**：
- 有未完成任务的陪审员
- 被申诉的陪审员
- 有争议的陪审员

**强制完成机制**：
```
如果陪审员申请退出但不完成任务：

第1天：发送提醒通知
第2天：发送警告通知
第3天：自动标记为"不参与"
      - 扣除20积分
      - 延长解锁期7天
      - 降低信用评分
```


### 防跑路场景分析

#### 场景1：接大额任务后立即退出 🚫
```
时间线：
T0: 陪审员被分配1000万TAI奖池任务
T1: 陪审员看到任务金额巨大
T2: 陪审员立即申请退出（想跑路）

系统处理：
- 检测到有未完成任务
- 触发"延迟到账"模式
- 质押金冻结72小时
- 必须完成任务投票
- 如果不投票：
  * 扣除20积分
  * 再延长7天解锁期
  * 降低信用评分
  * 可能被永久禁止

结果：跑路失败 ✅
```

#### 场景2：投错票后立即退出 🚫
```
时间线：
T0: 陪审员投票支持选项A
T1: 陪审员发现大多数人支持选项B
T2: 陪审员预感自己投错了
T3: 陪审员立即申请退出（想跑路）

系统处理：
- 检测到72小时内有任务
- 触发"标准到账"模式
- 24小时冷却期
- 期间用户可以发起申诉
- 如果被申诉：
  * 转入"延迟到账"模式
  * 质押金冻结
  * 等待申诉结果
  * 如果申诉成功：扣除25%质押

结果：跑路失败 ✅
```

#### 场景3：被申诉后尝试退出 🚫
```
时间线：
T0: 陪审员完成投票
T1: 用户发起申诉
T2: 陪审员收到申诉通知
T3: 陪审员立即申请退出（想跑路）

系统处理：
- 检测到有待处理申诉
- 触发"延迟到账"模式
- 质押金完全冻结
- 等待官方审核（最多7天）
- 审核结果：
  * 申诉成功：扣除25%质押 + 100积分
  * 申诉失败：正常到账

结果：跑路失败 ✅
```

#### 场景4：长期不活跃后退出 ✅
```
时间线：
T0: 陪审员质押10万TAI
T1-T90: 90天内无任务分配
T91: 陪审员申请退出

系统处理：
- 检测到72小时内无任务
- 触发"即时到账"模式
- 立即解锁质押金
- 质押金全额到账

结果：正常退出 ✅
```


### 退出界面设计

```
┌─────────────────────────────────────────────────────────┐
│  申请退出                                        [返回]   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  当前状态检查                                            │
│                                                          │
│  ✅ 质押金额: 100,000 TAI                               │
│  ✅ 当前积分: 256 pts                                   │
│  ⚠️ 未完成任务: 2 个                                    │
│  ✅ 待处理申诉: 0 个                                    │
│  ⚠️ 72小时内任务: 3 个                                  │
│                                                          │
│  预计到账时间: 72 小时后                                 │
│  到账金额: 100,000 TAI                                  │
│                                                          │
│  ⚠️ 注意事项:                                           │
│  • 你有 2 个未完成的任务，必须完成后才能提款            │
│  • 72小时内有任务记录，需要等待冷却期                   │
│  • 如果在此期间被申诉，提款时间会延长                   │
│  • 退出后积分清零，无法再次成为陪审员                   │
│                                                          │
│  [取消] [确认退出]                                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  退出流程说明                                            │
│                                                          │
│  📋 第1步：完成所有未完成任务 (当前: 2个)               │
│  ⏰ 第2步：等待72小时冷却期                             │
│  🔍 第3步：系统检查申诉和争议                           │
│  💰 第4步：质押金到账                                   │
│                                                          │
│  如果你想快速退出:                                       │
│  • 完成所有任务可缩短至24小时                           │
│  • 72小时内无任务可立即到账                             │
└─────────────────────────────────────────────────────────┘
```

### 退出状态追踪

```
┌─────────────────────────────────────────────────────────┐
│  退出进度                                                │
│                                                          │
│  状态: 等待中 ⏳                                         │
│  剩余时间: 48 小时                                       │
│                                                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  33% 完成                                                │
│                                                          │
│  ✅ 任务完成: 2/2                                       │
│  ⏰ 冷却期: 24/72 小时                                  │
│  🔍 申诉检查: 进行中                                    │
│  💰 质押金: 冻结中                                      │
│                                                          │
│  [取消退出] [查看详情]                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 数据库更新 - 退出机制

### 更新 jurors 表

```sql
ALTER TABLE jurors ADD COLUMN IF NOT EXISTS
  withdrawal_status TEXT DEFAULT NULL, -- null, pending, processing, completed
  withdrawal_requested_at TIMESTAMP,
  withdrawal_unlock_time TIMESTAMP,
  withdrawal_type TEXT, -- instant, standard, delayed
  last_task_at TIMESTAMP, -- 最后一次任务时间
  has_pending_appeals BOOLEAN DEFAULT FALSE;

CREATE INDEX idx_jurors_withdrawal_status ON jurors(withdrawal_status);
CREATE INDEX idx_jurors_withdrawal_unlock ON jurors(withdrawal_unlock_time);
```

### 新增 withdrawal_logs 表

```sql
CREATE TABLE withdrawal_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  juror_id UUID NOT NULL REFERENCES jurors(id),
  requested_at TIMESTAMP NOT NULL,
  unlock_type TEXT NOT NULL, -- instant, standard, delayed
  unlock_time INTEGER NOT NULL, -- 小时数
  unlock_at TIMESTAMP NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, cancelled
  staked_amount BIGINT NOT NULL,
  penalty_amount BIGINT DEFAULT 0,
  final_amount BIGINT NOT NULL,
  reason TEXT,
  completed_at TIMESTAMP,
  tx_hash TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_withdrawal_logs_juror_id ON withdrawal_logs(juror_id);
CREATE INDEX idx_withdrawal_logs_status ON withdrawal_logs(status);
CREATE INDEX idx_withdrawal_logs_unlock_at ON withdrawal_logs(unlock_at);
```

---

**更新完成！用代码战胜人性 ✅**



---

## 🎨 预测创建限制系统

### 创建频率限制

为了防止垃圾预测和提升内容质量，用户创建预测需要满足时间间隔要求。

| 用户类型 | 积分范围 | 等级 | 创建间隔 |
|---------|---------|------|---------|
| 普通用户 | - | 无 | 360小时 (15天) |
| 武林新丁 | 0-99 | Lv.1 | 72小时 (3天) |
| 风尘奇侠 | 100-399 | Lv.2 | 48小时 (2天) |
| 地狱判官 | 400-999 | Lv.3 | 24小时 (1天) |
| 天上天下天地无双 | 1000+ | Lv.4 | 6小时 |

### 创建费用

```
总费用 = 100 TAI + TON Gas 费

其中：
- 100 TAI：平台创建费（进入 DAO 储备池）
- TON Gas：链上合约执行费用（约 0.3 TON）
```

### 设计理念

1. **防止垃圾预测**：高门槛（360小时 + 100 TAI）
2. **鼓励成为陪审员**：陪审员享受更短间隔
3. **等级特权**：等级越高，创建越频繁
4. **经济平衡**：100 TAI 补充 DAO 储备池

### 创建权限检查

```typescript
interface CreatePermission {
  canCreate: boolean;
  reason?: string;
  nextAvailableTime?: Date;
  intervalHours: number;
  hoursRemaining: number;
  fee: {
    tai: number;
    estimatedGas: number;
  };
}
```

详细设计见：`MARKET_CREATION_LIMITS.md`

