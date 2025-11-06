#!/usr/bin/env tsx
import { Address, Cell, beginCell, toNano } from '@ton/core';
import { TonClient, WalletContractV4 } from '@ton/ton';
import { mnemonicToWalletKey } from '@ton/crypto';
import fs from 'node:fs';
import path from 'node:path';

type WhitelistMeta = {
  root: string | null;
  total: number;
};

type StartWhitelistSalePayload = {
  totalAmount: bigint;
  baselinePrice: bigint;
  currentPrice: bigint;
  windowSeconds: bigint;
  rootCell: Cell;
};

function loadMeta(metaPath: string): WhitelistMeta {
  if (!fs.existsSync(metaPath)) {
    throw new Error(`Meta file not found: ${metaPath}`);
  }
  return JSON.parse(fs.readFileSync(metaPath, 'utf-8')) as WhitelistMeta;
}

function buildPayload(meta: WhitelistMeta, totalAmount: bigint, baselinePrice: bigint, currentPrice: bigint, windowSeconds: bigint): StartWhitelistSalePayload {
  if (!meta.root) {
    throw new Error('Meta file missing root field');
  }
  return {
    totalAmount,
    baselinePrice,
    currentPrice,
    windowSeconds,
    rootCell: Cell.fromBase64(meta.root),
  };
}

async function sendStartWhitelistSale(args: StartWhitelistSalePayload, controller: Address, wallet: WalletContractV4, client: TonClient, secretKey: Buffer) {
  const msgBody = beginCell()
    .storeUint(0, 32)
    .storeUint(0, 64)
    .storeUint(0, 32)
    .storeRef(args.rootCell)
    .storeUint(args.totalAmount, 64)
    .storeUint(args.baselinePrice, 64)
    .storeUint(args.currentPrice, 64)
    .storeUint(args.windowSeconds, 32)
    .endCell();

  const seqno = await wallet.getSeqno(client);
  const transfer = await wallet.createTransfer({
    secretKey,
    seqno,
    to: controller,
    value: toNano('0.5'),
    sendMode: 3,
    body: msgBody,
  });

  await client.sendExternalMessage(wallet, transfer);
  console.log('✅ StartWhitelistSale message sent');
}

async function main() {
  const metaPath = process.argv[2] ?? path.resolve('whitelist_meta.json');
  const totalAmount = BigInt(process.argv[3] ?? '30000000000');
  const baselinePrice = BigInt(process.argv[4] ?? '50000000');
  const currentPrice = BigInt(process.argv[5] ?? baselinePrice.toString());
  const windowSeconds = BigInt(process.argv[6] ?? (72 * 3600).toString());
  const controllerAddress = Address.parse(process.argv[7] ?? 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c');

  const mnemonic = process.env.DEPLOY_MNEMONIC;
  const endpoint = process.env.TON_ENDPOINT;
  if (!mnemonic || !endpoint) {
    console.error('Missing DEPLOY_MNEMONIC or TON_ENDPOINT environment variables.');
    process.exit(1);
  }

  const meta = loadMeta(metaPath);
  const payload = buildPayload(meta, totalAmount, baselinePrice, currentPrice, windowSeconds);
  const keyPair = await mnemonicToWalletKey(mnemonic.split(' '));
  const wallet = WalletContractV4.create({ publicKey: keyPair.publicKey, workchain: 0 });
  const client = new TonClient({ endpoint });

  console.log('ℹ️ Sending StartWhitelistSale...', payload);
  await sendStartWhitelistSale(payload, controllerAddress, wallet, client, keyPair.secretKey);
}

main().catch((error) => {
  console.error('❌ Failed to deploy whitelist sale:', error);
  process.exit(1);
});
