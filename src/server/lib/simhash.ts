import { createHash } from 'node:crypto';

const BIT_LENGTH = 64;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9\u4e00-\u9fa5]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);
}

function hashToken(token: string): Buffer {
  return createHash('sha256').update(token).digest();
}

export function computeSimhash(text: string): bigint {
  const tokens = tokenize(text);
  if (tokens.length === 0) {
    return 0n;
  }

  const weights = new Map<string, number>();
  for (const token of tokens) {
    weights.set(token, (weights.get(token) ?? 0) + 1);
  }

  const vector = new Array<number>(BIT_LENGTH).fill(0);

  for (const [token, frequency] of weights) {
    const hash = hashToken(token);
    const weight = 1 + Math.log(frequency + 1);
    for (let bit = 0; bit < BIT_LENGTH; bit += 1) {
      const byteIndex = Math.floor(bit / 8);
      const bitOffset = 7 - (bit % 8);
      const isOne = ((hash[byteIndex] >> bitOffset) & 1) === 1;
      vector[bit] += isOne ? weight : -weight;
    }
  }

  let result = 0n;
  for (let i = 0; i < BIT_LENGTH; i += 1) {
    result <<= 1n;
    if (vector[i] >= 0) {
      result |= 1n;
    }
  }

  return result;
}

export function hammingDistance(a: bigint, b: bigint): number {
  let xor = a ^ b;
  let count = 0;
  while (xor > 0n) {
    xor &= xor - 1n;
    count += 1;
  }
  return count;
}

export function isSimilar(a: bigint, b: bigint, threshold = 10): boolean {
  return hammingDistance(a, b) <= threshold;
}
