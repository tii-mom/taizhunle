export type DaoLevelKey = 'normal' | 'l1' | 'l2' | 'l3' | 'l4';

export type DaoLevelDefinition = {
  key: DaoLevelKey;
  min: number;
  max: number;
  createHours: number;
  juryPerDay: number;
  stakeRequirement: number;
  stakeCooldownHours: number;
};

export const DAO_LEVELS: DaoLevelDefinition[] = [
  { key: 'normal', min: Number.NEGATIVE_INFINITY, max: -1, createHours: 360, juryPerDay: 0, stakeRequirement: 1_000, stakeCooldownHours: 72 },
  { key: 'l1', min: 0, max: 99, createHours: 360, juryPerDay: 3, stakeRequirement: 1_000, stakeCooldownHours: 72 },
  { key: 'l2', min: 100, max: 399, createHours: 72, juryPerDay: 9, stakeRequirement: 5_000, stakeCooldownHours: 48 },
  { key: 'l3', min: 400, max: 999, createHours: 48, juryPerDay: 30, stakeRequirement: 10_000, stakeCooldownHours: 24 },
  { key: 'l4', min: 1000, max: Number.POSITIVE_INFINITY, createHours: 6, juryPerDay: Infinity, stakeRequirement: 20_000, stakeCooldownHours: 6 },
];
