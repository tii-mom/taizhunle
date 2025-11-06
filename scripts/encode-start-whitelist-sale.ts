#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import { Cell } from '@ton/core';

type WhitelistMeta = {
  root: string | null;
  total: number;
};

function readMeta(metaPath: string): WhitelistMeta {
  if (!fs.existsSync(metaPath)) {
    throw new Error(`File not found: ${metaPath}`);
  }
  return JSON.parse(fs.readFileSync(metaPath, 'utf-8')) as WhitelistMeta;
}

function main() {
  const metaPath = process.argv[2] ?? path.resolve('whitelist_meta.json');
  const totalAmount = BigInt(process.argv[3] ?? '30000000000');
  const baselinePrice = BigInt(process.argv[4] ?? '50000000');
  const currentPrice = BigInt(process.argv[5] ?? baselinePrice.toString());
  const windowSeconds = BigInt(process.argv[6] ?? (72 * 3600).toString());

  const meta = readMeta(metaPath);
  if (!meta.root) {
    throw new Error('whitelist_meta.json missing "root"; run generate-whitelist-merkle first');
  }

  const merkleRootCell = Cell.fromBase64(meta.root);

  const payload = {
    $$type: 'StartWhitelistSale',
    merkleRoot: merkleRootCell.toBoc().toString('base64'),
    totalAmount: totalAmount.toString(),
    baselinePrice: baselinePrice.toString(),
    currentPrice: currentPrice.toString(),
    windowSeconds: windowSeconds.toString(),
  };

  console.log(JSON.stringify(payload, null, 2));
}

main();
