import type { JurorStatus } from './components/JurorStatusCard';

export type TaskType = 'dispute' | 'report' | 'timeout';
export type TaskStatus = 'pending' | 'review' | 'closed';

export type TaskItem = {
  id: string;
  type: TaskType;
  title: string;
  pool: number;
  jurorCount: number;
  reward: number;
  pointsGain: number;
  endsAt: number;
  status: TaskStatus;
};

export const jurorStatusMock: JurorStatus = {
  levelName: '地狱判官',
  levelBadge: 'Lv.3',
  levelEmoji: '⚔️',
  points: 612,
  nextLevelPoints: 1000,
  stakeAmount: 125000,
  accuracy: 92.4,
  remainingLabel: '30 次',
  weight: 7.25,
  perCasePoints: 6.2,
};

export const taskListMock: TaskItem[] = [
  {
    id: 'task-1',
    type: 'dispute',
    title: 'BTC 是否将在 12 月 15 日前突破 150K ?',
    pool: 520000,
    jurorCount: 7,
    reward: 4200,
    pointsGain: 6,
    endsAt: Date.now() + 1000 * 60 * 45,
    status: 'pending',
  },
  {
    id: 'task-2',
    type: 'report',
    title: 'TON NFT 空投是否按时发放？',
    pool: 165000,
    jurorCount: 5,
    reward: 820,
    pointsGain: 5,
    endsAt: Date.now() + 1000 * 60 * 15,
    status: 'review',
  },
  {
    id: 'task-3',
    type: 'timeout',
    title: '美股 CPI 公布后 12h 市场预测',
    pool: 78000,
    jurorCount: 3,
    reward: 320,
    pointsGain: 3,
    endsAt: Date.now() + 1000 * 60 * 5,
    status: 'pending',
  },
];

export const daoEarningsMock = {
  totalPooled: 2_480_000,
  pending: 38_500,
  today: 12_400,
  last7Days: 78_420,
  reserve: 1_250_000,
};
