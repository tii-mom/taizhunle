import { describe, it, expect } from 'vitest';

import { getCreateInterval, getCreationStakeRequirement } from '../src/utils/dao';

describe('creation interval', () => {
  it('returns 360h for non juror users regardless of points', () => {
    expect(getCreateInterval(0, false)).toBe(360);
    expect(getCreateInterval(500, false)).toBe(360);
  });

  it('returns tier specific intervals for jurors', () => {
    expect(getCreateInterval(0, true)).toBe(72);
    expect(getCreateInterval(150, true)).toBe(48);
    expect(getCreateInterval(450, true)).toBe(24);
    expect(getCreateInterval(800, true)).toBe(24);
    expect(getCreateInterval(1200, true)).toBe(6);
  });
});

describe('creation stake requirement', () => {
  it('maps points to stake and cooldown', () => {
    expect(getCreationStakeRequirement(-10)).toEqual({ stake: 1_000, cooldownHours: 72, maxStake: 20_000 });
    expect(getCreationStakeRequirement(50)).toEqual({ stake: 1_000, cooldownHours: 72, maxStake: 20_000 });
    expect(getCreationStakeRequirement(120)).toEqual({ stake: 5_000, cooldownHours: 48, maxStake: 20_000 });
    expect(getCreationStakeRequirement(550)).toEqual({ stake: 10_000, cooldownHours: 24, maxStake: 20_000 });
    expect(getCreationStakeRequirement(1500)).toEqual({ stake: 20_000, cooldownHours: 6, maxStake: 20_000 });
  });
});
