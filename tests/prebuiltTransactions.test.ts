import { describe, expect, it } from 'vitest';
import { buildTonTransferMessage } from '../src/services/prebuiltTransactions';

describe('buildTonTransferMessage', () => {
  it('produces a payload with memo encoded in base64 BOC', () => {
    const message = buildTonTransferMessage('EQCtestAddress', 1.234, 'RP-ORDER-123');
    expect(message.address).toBe('EQCtestAddress');
    expect(message.amount).toBe(String(Math.round(1.234 * 1e9)));
    expect(typeof message.payload).toBe('string');
    expect(message.payload.length).toBeGreaterThan(10);
  });
});
