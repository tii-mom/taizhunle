import { getCreationPermission, createMarketDraft, placeBet } from '../src/server/services/mockMarketService';
import { getCreationStakeRequirement } from '../src/utils/dao';

async function main() {
  const wallet = 'EQ-demo-wallet';
  const permission = await getCreationPermission(wallet);
  console.log('> creation permission', permission);

  const stakeInfo = getCreationStakeRequirement(permission.points);
  console.log('> expected stake requirement', stakeInfo);

  const draft = await createMarketDraft({
    title: 'Mock market quality check',
    closesAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    minStake: 1000,
    maxStake: 200000,
    creatorStakeTai: permission.requiredStakeTai,
  });
  console.log('> draft created', {
    stake: draft.creatorStakeTai,
    cooldown: draft.stakeCooldownHours,
    jurorRewardTai: draft.jurorRewardTai,
  });

  const afterBet = await placeBet({
    marketId: draft.id,
    amount: 15_000,
    side: 'yes',
    walletAddress: wallet,
  });
  const expectedReward = Math.max(100, Math.round(afterBet.pool * 0.01));
  console.log('> after bet', {
    pool: afterBet.pool,
    yesPool: afterBet.yesPool,
    rewardReported: afterBet.jurorRewardTai,
    expectedReward,
  });

  const check = afterBet.jurorRewardTai === expectedReward;
  console.log(check ? '✅ reward matches pool × 1%' : '❌ reward mismatch');

  console.log('> settlement checklist', {
    creatorStakeLocked: draft.creatorStakeTai,
    bets: afterBet.bets.length,
    endsAt: new Date(afterBet.endsAt).toISOString(),
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
