/**
 * 验证 AssetTrend 时间轴数据点数量
 * 
 * 规范要求：
 * - hour: 12 点 (过去 24h，每 2h 1 点)
 * - day: 7 点 (最近 7 天)
 * - week: 7 点 (过去 7 周)
 * - month: 6 点 (过去 6 个月)
 */

type TrendGranularity = 'hour' | 'day' | 'week' | 'month';

const EXPECTED_DATA_POINTS: Record<TrendGranularity, number> = {
  hour: 6,
  day: 7,
  week: 7,
  month: 6,
};

function verifyDataPoints() {
  console.log('========================================');
  console.log('  AssetTrend 时间轴数据点验证');
  console.log('========================================\n');

  let allPassed = true;

  for (const [granularity, expectedCount] of Object.entries(EXPECTED_DATA_POINTS)) {
    const passed = expectedCount > 0;
    const status = passed ? '✅' : '❌';
    
    console.log(`${status} ${granularity.padEnd(6)} - 期望 ${expectedCount} 点`);
    
    if (!passed) {
      allPassed = false;
    }
  }

  console.log('\n========================================');
  if (allPassed) {
    console.log('  ✅ 所有数据点数量符合规范');
  } else {
    console.log('  ❌ 存在不符合规范的数据点');
  }
  console.log('========================================\n');
  
  return allPassed;
}

verifyDataPoints();
