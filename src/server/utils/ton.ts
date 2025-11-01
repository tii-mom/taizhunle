import { Address } from '@ton/core';
import config from '../../config/env.js';

export function isValidTonAddress(address: string | undefined | null): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  try {
    Address.parseFriendly(address);
    return true;
  } catch {
    try {
      Address.parse(address);
      return true;
    } catch {
      return false;
    }
  }
}

export function normalizeTonAddress(address: string): string {
  const testOnly = config.ton.network !== 'mainnet';
  try {
    const friendly = Address.parseFriendly(address);
    return friendly.address.toString({ testOnly });
  } catch {
    try {
      const parsed = Address.parse(address);
      return parsed.toString({ testOnly });
    } catch {
      return address;
    }
  }
}
