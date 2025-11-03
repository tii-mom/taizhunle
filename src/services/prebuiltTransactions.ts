import { beginCell } from '@ton/core';

export function buildTonTransferMessage(address: string, tonAmount: number, memo: string) {
  const amountNano = Math.round(tonAmount * 1e9);
  const payload = beginCell().storeUint(0, 32).storeStringTail(memo).endCell().toBoc().toString('base64');

  return {
    address,
    amount: amountNano.toString(),
    payload,
  } as const;
}
