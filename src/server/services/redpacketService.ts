import { randomBytes } from 'crypto';
import config from '../../config/env.js';
import { PURCHASE_EXPIRATION_MINUTES, PURCHASE_STATUS, REDPACKET_PAYMENT_ADDRESS } from '../constants/redpacket.js';
import { supabase } from './supabaseClient.js';
import type {
  RedpacketPurchaseInsert,
  RedpacketPurchaseRow,
  RedpacketSalesInsert,
  RedpacketSalesRow,
  UserBalanceInsert,
  UserBalanceRow,
} from '../types/database.js';

export interface RedpacketSale {
  id: string;
  saleCode: string | null;
  priceTon: number;
  baseTai: number;
  maxTai: number;
  totalTai: number;
  soldTai: number;
  soldOut: boolean;
  accelerate: boolean;
  accelerateRate: number;
  priceAdjustment: number;
  expiresAt: string;
  startAt: string;
  memoPrefix: string;
}

export interface RedpacketStatus {
  priceTON: number;
  soldTAI: number;
  totalTAI: number;
  countdown: number;
  soldOut: boolean;
  accelerate: boolean;
  priceAdjustment: number;
}

export interface PurchaseSession {
  purchaseId: string;
  address: string;
  memo: string;
  priceTON: number;
  baseTAI: number;
  maxTAI: number;
  expiresAt: number;
  accelerate: boolean;
}

export interface PurchaseSignaturePayload {
  purchaseId: string;
  unsignedBoc: string;
  amountTAI: number;
  tonAmount: number;
  memo: string;
  accelerate: boolean;
  multiplier: number;
}

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === 'number') {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatSaleCode(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function computeTotalTai(baseTai: number, maxTai: number): number {
  if (baseTai <= 0 && maxTai <= 0) {
    return 0;
  }

  if (baseTai <= 0) {
    return Math.round(maxTai / 1.3);
  }

  if (maxTai <= 0) {
    return Math.round(baseTai / 0.7);
  }

  const totalFromBase = baseTai / 0.7;
  const totalFromMax = maxTai / 1.3;
  return Math.round((totalFromBase + totalFromMax) / 2);
}

function mapSale(row: RedpacketSalesRow): RedpacketSale {
  return {
    id: row.id,
    saleCode: row.sale_code ?? null,
    priceTon: toNumber(row.price_ton),
    baseTai: toNumber(row.base_tai),
    maxTai: toNumber(row.max_tai),
    totalTai: toNumber(row.total_tai),
    soldTai: toNumber(row.sold_tai),
    soldOut: Boolean(row.sold_out),
    accelerate: Boolean(row.accelerate),
    accelerateRate: toNumber(row.accelerate_rate),
    priceAdjustment: toNumber(row.price_adjustment),
    expiresAt: row.expires_at,
    startAt: row.start_at ?? row.created_at,
    memoPrefix: row.memo_prefix ?? 'RP',
  };
}

function mapPurchase(row: RedpacketPurchaseRow): RedpacketPurchaseRow {
  return row;
}

function generateMemo(prefix: string, saleCode: string | null): string {
  const randomPart = randomBytes(4).toString('hex').toUpperCase();
  return saleCode ? `${prefix}-${saleCode}-${randomPart}` : `${prefix}-${randomPart}`;
}

async function fetchLatestSale(): Promise<RedpacketSalesRow | null> {
  const { data, error } = await supabase
    .from('redpacket_sales')
    .select('*')
    .order('expires_at', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(`Failed to fetch redpacket sales: ${error.message}`);
  }

  return data?.[0] ?? null;
}

async function createDefaultSale(): Promise<RedpacketSale> {
  const baseTai = toNumber(config.business.redpacket.baseAmount ?? 0) || 700_000;
  const maxTai = toNumber(config.business.redpacket.maxAmount ?? 0) || 1_300_000;
  const priceTon = toNumber(config.business.redpacket.priceTon ?? 0) || 9.99;
  const totalTai = computeTotalTai(baseTai, maxTai) || 1_000_000;

  const now = new Date();
  const expiresAt = new Date(now.getTime());
  expiresAt.setUTCHours(23, 59, 59, 0);

  const payload: RedpacketSalesInsert = {
    sale_code: formatSaleCode(now),
    price_ton: priceTon,
    base_tai: baseTai,
    max_tai: maxTai,
    total_tai: totalTai,
    sold_tai: 0,
    sold_out: false,
    accelerate: false,
    accelerate_rate: 0,
    price_adjustment: 0,
    start_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    memo_prefix: 'RP',
  };

  const { data, error } = await supabase
    .from('redpacket_sales')
    .insert(payload)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Failed to create default redpacket sale: ${error?.message ?? 'Unknown error'}`);
  }

  return mapSale(data);
}

async function ensureSaleRecord(): Promise<RedpacketSale> {
  const latest = await fetchLatestSale();

  if (!latest) {
    return createDefaultSale();
  }

  const sale = mapSale(latest);

  if (new Date(sale.expiresAt).getTime() <= Date.now() || sale.soldOut) {
    return createDefaultSale();
  }

  return sale;
}

async function updateSaleTotals(saleId: string, soldTai: number, soldOut: boolean): Promise<void> {
  const { error } = await supabase
    .from('redpacket_sales')
    .update({ sold_tai: soldTai, sold_out: soldOut })
    .eq('id', saleId);

  if (error) {
    console.error('Failed to update sale totals', error);
  }
}

async function expirePendingPurchases(saleId: string) {
  const nowIso = new Date().toISOString();

  const { error } = await supabase
    .from('redpacket_purchases')
    .update({ status: PURCHASE_STATUS.expired })
    .eq('sale_id', saleId)
    .eq('status', PURCHASE_STATUS.pending)
    .lt('expires_at', nowIso);

  if (error) {
    console.error('Failed to expire pending purchases', error);
  }
}

async function upsertUserBalance(wallet: string, deltaTai: number, deltaTon: number): Promise<void> {
  const { data, error } = await supabase
    .from('user_balances')
    .select('*')
    .eq('wallet_address', wallet)
    .limit(1);

  if (error) {
    console.error('Failed to fetch user balance', error);
    return;
  }

  const existing = data?.[0] as UserBalanceRow | undefined;

  if (!existing) {
    const insertPayload: UserBalanceInsert = {
      wallet_address: wallet,
      total_tai: deltaTai,
      available_tai: deltaTai,
      locked_tai: 0,
      total_ton: deltaTon,
    };

    const { error: insertError } = await supabase
      .from('user_balances')
      .insert(insertPayload);

    if (insertError) {
      console.error('Failed to insert user balance', insertError);
    }

    return;
  }

  const updatedPayload = {
    total_tai: toNumber(existing.total_tai) + deltaTai,
    available_tai: toNumber(existing.available_tai) + deltaTai,
    total_ton: toNumber(existing.total_ton) + deltaTon,
  };

  const { error: updateError } = await supabase
    .from('user_balances')
    .update(updatedPayload)
    .eq('wallet_address', wallet);

  if (updateError) {
    console.error('Failed to update user balance', updateError);
  }
}

export async function getCurrentSaleStatus(): Promise<RedpacketStatus> {
  const sale = await ensureSaleRecord();

  await expirePendingPurchases(sale.id);

  const { data, error } = await supabase
    .from('redpacket_purchases')
    .select('amount_tai, status')
    .eq('sale_id', sale.id);

  if (error) {
    throw new Error(`Failed to fetch redpacket purchases: ${error.message}`);
  }

  let soldTai = 0;

  if (data) {
    for (const purchase of data) {
      const amount = toNumber(purchase.amount_tai);
      if (!amount) {
        continue;
      }

      if (
        purchase.status === PURCHASE_STATUS.awaitingSignature ||
        purchase.status === PURCHASE_STATUS.completed
      ) {
        soldTai += amount;
      }
    }
  }

  const soldOut = sale.soldOut || soldTai >= sale.totalTai || new Date(sale.expiresAt).getTime() <= Date.now();

  if (soldTai !== sale.soldTai || soldOut !== sale.soldOut) {
    await updateSaleTotals(sale.id, soldTai, soldOut);
  }

  return {
    priceTON: sale.priceTon,
    soldTAI: soldTai,
    totalTAI: sale.totalTai,
    countdown: new Date(sale.expiresAt).getTime(),
    soldOut,
    accelerate: sale.accelerate,
    priceAdjustment: sale.priceAdjustment,
  };
}

export async function createPurchaseSession(wallet: string): Promise<PurchaseSession> {
  if (!wallet) {
    throw new Error('Wallet address is required');
  }

  const sale = await ensureSaleRecord();

  if (sale.soldOut || new Date(sale.expiresAt).getTime() <= Date.now()) {
    throw new Error('Current sale is not available');
  }

  await expirePendingPurchases(sale.id);

  const { data: existingRows, error: existingError } = await supabase
    .from('redpacket_purchases')
    .select('*')
    .eq('wallet_address', wallet)
    .eq('sale_id', sale.id)
    .eq('status', PURCHASE_STATUS.pending)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1);

  if (existingError) {
    throw new Error(`Failed to check existing purchases: ${existingError.message}`);
  }

  if (existingRows?.length) {
    const pending = mapPurchase(existingRows[0]);
    const expiresAt = pending.expires_at ? new Date(pending.expires_at).getTime() : Date.now();

    return {
      purchaseId: pending.id,
      address: REDPACKET_PAYMENT_ADDRESS,
      memo: pending.memo,
      priceTON: sale.priceTon,
      baseTAI: sale.baseTai,
      maxTAI: sale.maxTai,
      expiresAt,
      accelerate: Boolean(pending.accelerate ?? sale.accelerate),
    };
  }

  const memo = generateMemo(sale.memoPrefix, sale.saleCode ?? null);
  const expiresAt = new Date(Date.now() + PURCHASE_EXPIRATION_MINUTES * 60 * 1000);

  const payload: RedpacketPurchaseInsert = {
    sale_id: sale.id,
    wallet_address: wallet,
    customer_wallet: wallet,
    memo,
    status: PURCHASE_STATUS.pending,
    ton_amount: sale.priceTon,
    reward_base_tai: sale.baseTai,
    reward_max_tai: sale.maxTai,
    expires_at: expiresAt.toISOString(),
    accelerate: sale.accelerate,
  };

  const { data, error } = await supabase
    .from('redpacket_purchases')
    .insert(payload)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Failed to create purchase session: ${error?.message ?? 'Unknown error'}`);
  }

  return {
    purchaseId: data.id,
    address: REDPACKET_PAYMENT_ADDRESS,
    memo,
    priceTON: sale.priceTon,
    baseTAI: sale.baseTai,
    maxTAI: sale.maxTai,
    expiresAt: expiresAt.getTime(),
    accelerate: sale.accelerate,
  };
}

export async function getPurchaseForWallet(wallet: string, memo: string): Promise<PurchaseSignaturePayload | null> {
  if (!wallet || !memo) {
    return null;
  }

  const { data, error } = await supabase
    .from('redpacket_purchases')
    .select('*')
    .eq('wallet_address', wallet)
    .eq('memo', memo)
    .limit(1);

  if (error) {
    throw new Error(`Failed to fetch purchase: ${error.message}`);
  }

  if (!data?.length) {
    return null;
  }

  const purchase = mapPurchase(data[0]);

  if (purchase.status !== PURCHASE_STATUS.awaitingSignature && purchase.status !== PURCHASE_STATUS.completed) {
    return null;
  }

  if (!purchase.unsigned_boc) {
    return null;
  }

  return {
    purchaseId: purchase.id,
    unsignedBoc: purchase.unsigned_boc,
    amountTAI: toNumber(purchase.amount_tai),
    tonAmount: toNumber(purchase.ton_amount),
    memo: purchase.memo,
    accelerate: Boolean(purchase.accelerate),
    multiplier: toNumber(purchase.tai_multiplier) || 1,
  };
}

export async function markPurchaseAwaitingSignature(args: {
  purchaseId: string;
  amountTai: number;
  tonAmount: number;
  txHash: string;
  unsignedBoc: string;
  accelerate: boolean;
  multiplier: number;
}): Promise<void> {
  const { error } = await supabase
    .from('redpacket_purchases')
    .update({
      status: PURCHASE_STATUS.awaitingSignature,
      amount_tai: args.amountTai,
      ton_amount: args.tonAmount,
      tx_hash: args.txHash,
      unsigned_boc: args.unsignedBoc,
      payment_detected_at: new Date().toISOString(),
      accelerate: args.accelerate,
      tai_multiplier: args.multiplier,
    })
    .eq('id', args.purchaseId);

  if (error) {
    throw new Error(`Failed to mark purchase awaiting signature: ${error.message}`);
  }
}

export async function markPurchaseCompleted(purchaseId: string, signature: string): Promise<void> {
  const { error } = await supabase
    .from('redpacket_purchases')
    .update({
      status: PURCHASE_STATUS.completed,
      signature,
      processed_at: new Date().toISOString(),
    })
    .eq('id', purchaseId);

  if (error) {
    throw new Error(`Failed to mark purchase completed: ${error.message}`);
  }
}

export async function recordPurchasePayout(args: {
  saleId: string;
  wallet: string;
  taiAmount: number;
  tonAmount: number;
}): Promise<void> {
  await upsertUserBalance(args.wallet, args.taiAmount, args.tonAmount);
  await updateSaleSoldTai(args.saleId, args.taiAmount);
}

export async function findPurchaseByMemo(memo: string): Promise<RedpacketPurchaseRow | null> {
  const { data, error } = await supabase
    .from('redpacket_purchases')
    .select('*')
    .eq('memo', memo)
    .limit(1);

  if (error) {
    throw new Error(`Failed to find purchase by memo: ${error.message}`);
  }

  return data?.[0] ?? null;
}

export async function loadSaleById(id: string): Promise<RedpacketSale | null> {
  const { data, error } = await supabase
    .from('redpacket_sales')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return mapSale(data);
}

export async function updateSaleSoldTai(saleId: string, deltaTai: number): Promise<void> {
  const { data, error } = await supabase
    .from('redpacket_sales')
    .select('sold_tai, total_tai')
    .eq('id', saleId)
    .single();

  if (error || !data) {
    console.error('Failed to fetch sale totals for update', error);
    return;
  }

  const newSold = toNumber(data.sold_tai) + deltaTai;
  const total = toNumber(data.total_tai);

  await updateSaleTotals(saleId, newSold, newSold >= total);
}

export function getPaymentAddress(): string {
  return REDPACKET_PAYMENT_ADDRESS;
}
