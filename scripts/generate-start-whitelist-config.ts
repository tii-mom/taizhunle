#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';

type WhitelistMeta = {
  root: string | null;
  total: number;
};

function loadJson<T>(filePath: string): T {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

function main() {
  const metaPath = process.argv[2] ?? path.resolve('whitelist_meta.json');
  const totalAmount = BigInt(process.argv[3] ?? '30000000000');
  const baselinePrice = BigInt(process.argv[4] ?? '50000000');
  const currentPrice = BigInt(process.argv[5] ?? baselinePrice.toString());
  const windowSeconds = BigInt(process.argv[6] ?? (72 * 3600).toString());

  const meta = loadJson<WhitelistMeta>(metaPath);
  if (!meta.root) {
    throw new Error('Merkle root missing in whitelist meta. Did you run generate-whitelist-merkle ?');
  }

  const payload = {
    rootBase64: meta.root,
    totalAmount: totalAmount.toString(),
    baselinePrice: baselinePrice.toString(),
    currentPrice: currentPrice.toString(),
    windowSeconds: windowSeconds.toString(),
  };

  console.log(JSON.stringify(payload, null, 2));
}

main();
