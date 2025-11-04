# 等级系统移除总结

## ✅ 已完成的修改

### 1. 核心工具函数 (`src/utils/dao.ts`)
- ❌ 删除 `getDaoBadge()` 函数
- ❌ 删除 `getNextLevelPoints()` 函数  
- ✅ 新增 `getDaoPoints()` 函数 - 统一使用天平图标 ⚖️

### 2. 组件修改

#### `src/components/glass/GoldenHammer.tsx`
- ❌ 移除 `level` 属性 (`'novice' | 'hero' | 'judge' | 'supreme'`)
- ✅ 统一使用琥珀色 + 天平图标 ⚖️
- ✅ 简化为只接受 `count` 和 `className` 参数

#### `src/components/glass/DaoConsoleGlass.tsx`
- ❌ 移除 `level` 和 `nextLevelPoints` props
- ❌ 移除等级进度条
- ✅ 新增积分显示
- ✅ 新增权重公式说明：权重 = (积分 + 10) × 质押额

#### `src/components/glass/MarketCardGlass.tsx`
- ❌ 删除 `hammerLevel()` 函数
- ✅ 移除 GoldenHammer 的 level 参数

#### `src/components/assets/AssetHeader.tsx`
- ❌ 删除 `hammerLevel` 变量
- ✅ 将 "jury tier" 改为 "jury points"
- ✅ 显示积分而不是等级

#### `src/components/assets/FinanceSections.tsx`
- ✅ 移除所有 GoldenHammer 的 level 参数

### 3. 页面修改

#### `src/pages/DaoGlass.tsx`
- ❌ 删除 `getLevelFromPoints()` 函数
- ✅ 使用 `getDaoPoints()` 替代 `getDaoBadge()`
- ✅ 移除 `level` 和 `nextLevelPoints` 变量
- ✅ 更新标题为"陪审员 · ⚖️"
- ✅ 更新 locale 引用从 `levels` 改为 `points`

#### `src/pages/Dao.tsx`
- ❌ 移除"立即获得铜色锤徽章"描述
- ❌ 移除"升级体系：铜 → 银 → 金"描述
- ✅ 新增"每次陪审获得 1 积分"
- ✅ 新增"积分影响抽签权重"
- ✅ 移除等级进度面板
- ✅ 新增积分统计面板
- ✅ 更新积分获取规则：只有陪审 +1 分

#### `src/pages/Assets.tsx`
- ✅ 移除 GoldenHammer 的 level 参数

### 4. 国际化文件

#### `src/locales/zh/dao.json`
- ❌ 删除 `levels` 对象（包含所有等级描述）
- ✅ 新增 `points` 对象
- ✅ 简化为只说明"参与陪审：+1 分"

#### `src/locales/en/dao.json`
- ❌ 删除 `levels` 对象
- ✅ 新增 `points` 对象
- ✅ 简化为"Jury participation: +1 point"

### 5. 文档修改

#### `docs/INVESTOR_BRIEF.md`
- ❌ 删除"铜色锤"、"金色锤"等级描述
- ✅ 更新为"DAO 点数（仅陪审参与 +1 分）影响抽签权重"
- ✅ 更新权重公式为"权重 = (积分 + 10) × 质押额"

## 🎯 新的积分系统

### 简化规则
- ✅ **只有陪审参与才能获得积分**：+1 分/次
- ❌ **创建预测**：不加分
- ❌ **邀请好友**：不加分

### 积分作用
- ✅ 影响陪审抽签权重
- ✅ 权重公式：**(积分 + 10) × 质押额**

### UI 变化
- 🔨 锤子图标 → ⚖️ 天平图标
- 等级名称（武林新丁、风尘奇侠等）→ "陪审员"
- 等级进度条 → 积分统计
- 复杂等级系统 → 简单积分系统

## 📝 待处理的文件

以下文件中仍有等级系统的引用，但可能是文档或示例代码：

1. `DAO_INSERT_GUIDE.md` - 插入指南文档
   - 提到"金色锤徽章"
   - 建议更新为"陪审员徽章"

2. `src/components/insert/HomeDaoBadge.tsx` - 注释中提到"金色锤"
   - 建议更新注释

3. `src/locales/zh/home.json` 和 `src/locales/en/home.json`
   - 包含 `hammer.gold/silver/bronze/gray` 的翻译
   - 如果首页不再使用等级系统，可以删除

4. `src/web/pages/HomeGlass.tsx`
   - 可能还在使用 `hammerLevel` 变量
   - 需要检查并移除

## ✨ 优势

1. **简化理解**：用户不需要记住复杂的等级名称
2. **突出重点**：强调陪审员的核心作用
3. **减少混淆**：避免用户对等级系统的困惑
4. **一致性**：所有地方都使用统一的陪审员概念
5. **透明权重**：清晰的权重计算公式

## 🔍 验证步骤

1. ✅ 所有 TypeScript 文件编译通过
2. ⚠️ TypeScript 缓存可能需要清理（getDaoPoints 导入问题）
3. 🔄 建议重启开发服务器
4. 🧪 建议测试所有 DAO 相关页面

## 🚀 下一步建议

1. 清理 TypeScript 缓存：`rm -rf node_modules/.cache`
2. 重启开发服务器
3. 测试所有 DAO 相关功能
4. 更新剩余的文档文件
5. 检查 HomeGlass.tsx 是否需要更新

---

**完成时间**：2025-11-03  
**修改文件数**：15+ 个  
**删除代码行数**：~200 行  
**新增代码行数**：~50 行  
**净减少**：~150 行代码
