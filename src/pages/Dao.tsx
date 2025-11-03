/**
 * DAO Page
 * DAO 页面 - 显示用户的 DAO 收益和统计
 */

import { DaoPoolCard } from '../components/dao/DaoPoolCard';
import { FeeBreakdown } from '../components/dao/FeeBreakdown';
import { PageLayout } from '../components/layout/PageLayout';
import { Award, TrendingUp, Users, Info } from 'lucide-react';

export function Dao() {
  // 模拟用户 ID（实际应该从认证系统获取）
  const userId = 'current_user';

  // 模拟奖池（用于演示分账）
  const examplePool = 1000000;

  return (
    <PageLayout>
      <div className="space-y-6 pb-32 lg:pb-6">
        {/* 页面标题 */}
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-text-primary">DAO 收益中心</h1>
          <p className="text-text-secondary">参与创建、陪审、邀请，获得 DAO 收益</p>
        </header>

        {/* 主要内容 */}
        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          {/* 左侧：DAO 池卡片 */}
          <div className="space-y-6">
            <DaoPoolCard userId={userId} />

            {/* 如何获得收益 */}
            <div className="space-y-4 rounded-2xl border border-border-light bg-surface-glass/60 p-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Info size={20} className="text-accent" />
                <h2 className="text-xl font-semibold text-text-primary">如何获得 DAO 收益？</h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-xl border border-border-light bg-surface-glass/60 p-4 backdrop-blur-md">
                  <TrendingUp size={20} className="mt-0.5 flex-shrink-0 text-[#10B981]" />
                  <div>
                    <h3 className="font-semibold text-text-primary">创建预测市场</h3>
                    <p className="mt-1 text-sm text-text-secondary">
                      创建话题即可获得 0.5% 的奖池分成，每局最高可得 5,000 TAI
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-border-light bg-surface-glass/60 p-4 backdrop-blur-md">
                  <Award size={20} className="mt-0.5 flex-shrink-0 text-[#F59E0B]" />
                  <div>
                    <h3 className="font-semibold text-text-primary">成为陪审员</h3>
                    <p className="mt-1 text-sm text-text-secondary">
                      质押 ≥1000 TAI 成为陪审员，投票正确可获得 1.0% 的奖池分成
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-border-light bg-surface-glass/60 p-4 backdrop-blur-md">
                  <Users size={20} className="mt-0.5 flex-shrink-0 text-[#8B5CF6]" />
                  <div>
                    <h3 className="font-semibold text-text-primary">邀请好友</h3>
                    <p className="mt-1 text-sm text-text-secondary">
                      邀请好友参与预测，可获得 0.5% 的奖池分成作为返利
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：分账明细 */}
          <aside className="space-y-6">
            <FeeBreakdown pool={examplePool} />

            {/* 成为陪审员 */}
            <div className="space-y-4 rounded-2xl border border-[#F59E0B]/30 bg-gradient-to-br from-[#F59E0B]/10 via-surface-glass/60 to-surface-glass/60 p-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Award size={24} className="text-[#F59E0B]" />
                <h2 className="text-xl font-semibold text-text-primary">成为陪审员</h2>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-border-light bg-surface-glass/60 p-4 backdrop-blur-md">
                  <p className="text-sm text-text-secondary">质押要求</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-[#F59E0B]">≥ 1,000 TAI</p>
                </div>

                <div className="space-y-2 text-sm text-text-secondary">
                  <p>✅ 立即获得铜色锤徽章</p>
                  <p>✅ 参与预测市场陪审</p>
                  <p>✅ 投票正确获得 1% 奖池</p>
                  <p>✅ 升级体系：铜 → 银 → 金</p>
                </div>

                <button
                  type="button"
                  className="w-full rounded-xl border border-transparent bg-gradient-to-r from-[#F59E0B] to-[#D97706] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:ring-2 hover:ring-[#F59E0B]/50 hover:shadow-[#F59E0B]/20 active:scale-95"
                >
                  立即质押
                </button>
              </div>
            </div>

            {/* DAO 规则 */}
            <div className="rounded-xl border border-border-light bg-surface-glass/60 p-4 text-xs text-text-secondary backdrop-blur-md">
              <p className="font-semibold text-text-primary">DAO 规则</p>
              <ul className="mt-2 space-y-1">
                <li>• 所有收益汇入 DAO 池</li>
                <li>• 用户按贡献领取</li>
                <li>• 集中领取仅付 1 次 Gas</li>
                <li>• 平台 0 保留，100% 分配</li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </PageLayout>
  );
}
