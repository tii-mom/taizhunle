/**
 * Fee Breakdown Component
 * 收益明细弹层 - 显示分账详情
 */

import { Info } from 'lucide-react';

interface FeeMap {
  create: number;
  jury: number;
  invite: number;
  platform: number;
  reserve: number;
}

interface Props {
  pool: number;
  showDetails?: boolean;
}

// 计算分账（与后端保持一致）
function distributeFees(pool: number): FeeMap {
  const BASIS_POINTS = 10000;
  const FEE_CREATE = 500; // 0.5%
  const FEE_JURY = 1000; // 1.0%
  const FEE_INVITE = 500; // 0.5%
  const FEE_PLATFORM = 500; // 0.5%
  const FEE_RESERVE = 2500; // 2.5%

  return {
    create: Math.floor((pool * FEE_CREATE) / BASIS_POINTS),
    jury: Math.floor((pool * FEE_JURY) / BASIS_POINTS),
    invite: Math.floor((pool * FEE_INVITE) / BASIS_POINTS),
    platform: Math.floor((pool * FEE_PLATFORM) / BASIS_POINTS),
    reserve: Math.floor((pool * FEE_RESERVE) / BASIS_POINTS),
  };
}

export function FeeBreakdown({ pool, showDetails = true }: Props) {
  const fees = distributeFees(pool);
  const totalFee = fees.create + fees.jury + fees.invite + fees.platform + fees.reserve;

  if (!showDetails) {
    return (
      <div className="text-sm text-text-secondary">
        手续费：{totalFee.toLocaleString()} TAI (2.5%)
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-border-light bg-surface-glass/60 p-4 backdrop-blur-md">
      <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
        <Info size={16} className="text-accent" />
        <span>收益分配明细</span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">创建者 (0.5%)</span>
          <span className="font-mono font-semibold text-[#10B981]">{fees.create.toLocaleString()} TAI</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-text-secondary">陪审员 (1.0%)</span>
          <span className="font-mono font-semibold text-[#F59E0B]">{fees.jury.toLocaleString()} TAI</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-text-secondary">邀请者 (0.5%)</span>
          <span className="font-mono font-semibold text-[#8B5CF6]">{fees.invite.toLocaleString()} TAI</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-text-secondary">平台 (0.5%)</span>
          <span className="font-mono font-semibold text-text-secondary">{fees.platform.toLocaleString()} TAI</span>
        </div>

        <div className="flex items-center justify-between border-t border-border-light pt-2">
          <span className="text-text-secondary">储备金 (2.5%)</span>
          <span className="font-mono font-semibold text-accent">{fees.reserve.toLocaleString()} TAI</span>
        </div>

        <div className="flex items-center justify-between border-t border-border-light pt-2 font-semibold">
          <span className="text-text-primary">总计</span>
          <span className="font-mono text-accent">{totalFee.toLocaleString()} TAI</span>
        </div>
      </div>

      <div className="rounded-lg bg-accent/10 p-3 text-xs text-text-secondary">
        <p>💡 所有收益汇入 DAO 池，用户按贡献领取</p>
      </div>
    </div>
  );
}
