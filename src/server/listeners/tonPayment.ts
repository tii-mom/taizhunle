import config from '../../config/env.js';
import { PURCHASE_STATUS, REDPACKET_PAYMENT_ADDRESS } from '../constants/redpacket.js';
import {
  findPurchaseByMemo,
  loadSaleById,
  markPurchaseAwaitingSignature,
  recordPurchasePayout,
} from '../services/redpacketService.js';
import { normalizeTonAddress } from '../utils/ton.js';
import { Address, beginCell } from '@ton/core';

interface ToncenterTransaction {
  transaction_id: {
    lt: string;
    hash: string;
  };
  in_msg?: {
    source?: string;
    value?: string;
    msg_data?: {
      ['@type']?: string;
      text?: string;
      text_base64?: string;
    };
  };
}

interface ToncenterResponse {
  ok: boolean;
  result?: ToncenterTransaction[];
  error?: string;
}

const POLL_INTERVAL_MS = 15_000;
const MAX_PROCESSED_CACHE = 512;
const TON_DECIMALS = 1_000_000_000;

function toTonAmount(value?: string): number {
  if (!value) {
    return 0;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return numeric / TON_DECIMALS;
}

function toTaiAmount(value: number): bigint {
  return BigInt(Math.round(value * TON_DECIMALS));
}

function buildUnsignedTaiBoc(params: {
  destination: string;
  taiAmount: number;
  memo: string;
  saleId: string;
  txHash: string;
}): string {
  const destination = Address.parseFriendly(params.destination).address;
  const queryId = BigInt.asUintN(64, BigInt(Date.now()));
  const payload = `${params.saleId}|${params.memo}`;

  const body = beginCell()
    .storeUint(0x52504159, 32) // 'RPAY'
    .storeUint(queryId, 64)
    .storeCoins(toTaiAmount(params.taiAmount))
    .storeAddress(destination)
    .storeRef(beginCell().storeStringTail(payload).endCell())
    .endCell();

  return body.toBoc({ idx: false }).toString('base64');
}

function extractMemo(tx: ToncenterTransaction): string | null {
  const data = tx.in_msg?.msg_data;

  if (!data) {
    return null;
  }

  if (typeof data.text === 'string' && data.text.length > 0) {
    return data.text.trim();
  }

  if (typeof data.text_base64 === 'string') {
    try {
      const decoded = Buffer.from(data.text_base64, 'base64').toString('utf8').replace(/\0+$/, '');
      return decoded.trim() || null;
    } catch {
      return null;
    }
  }

  return null;
}

class TonPaymentListener {
  private timer?: NodeJS.Timeout;
  private processedHashes = new Set<string>();
  private initialised = false;

  start() {
    if (!config.ton.apiEndpoint) {
      console.warn('TON payment listener disabled: TON_API_ENDPOINT not configured');
      return;
    }

    if (!config.ton.apiKey) {
      console.warn('TON payment listener disabled: TON_API_KEY not configured');
      return;
    }

    if (this.timer) {
      return;
    }

    void this.poll();
    this.timer = setInterval(() => {
      void this.poll();
    }, POLL_INTERVAL_MS);

    console.log('🔔 TON payment listener started');
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private async poll() {
    try {
      const response = await this.fetchTransactions();

      if (!response.ok) {
        console.error('TON payment listener error:', response.error ?? 'Unknown error');
        return;
      }

      const transactions = response.result ?? [];

      if (!this.initialised) {
        for (const tx of transactions) {
          this.cacheHash(tx.transaction_id.hash);
        }
        this.initialised = true;
        return;
      }

      for (const tx of transactions.reverse()) {
        const id = tx.transaction_id.hash;
        if (this.processedHashes.has(id)) {
          continue;
        }

        await this.processTransaction(tx);
        this.cacheHash(id);
      }
    } catch (error) {
      console.error('TON payment poll failed:', error);
    }
  }

  private async fetchTransactions(): Promise<ToncenterResponse> {
    const endpoint = new URL('getTransactions', config.ton.apiEndpoint!);
    endpoint.searchParams.set('address', REDPACKET_PAYMENT_ADDRESS);
    endpoint.searchParams.set('limit', '20');
    endpoint.searchParams.set('archival', 'false');

    const response = await fetch(endpoint.toString(), {
      headers: {
        'X-API-Key': config.ton.apiKey ?? '',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return { ok: false, error: `HTTP ${response.status}` };
    }

    const data = (await response.json()) as ToncenterResponse;
    return data;
  }

  private async processTransaction(tx: ToncenterTransaction) {
    const memo = extractMemo(tx);
    if (!memo) {
      return;
    }

    const purchase = await findPurchaseByMemo(memo);
    if (!purchase || purchase.status !== PURCHASE_STATUS.pending) {
      return;
    }

    if (!purchase.sale_id) {
      console.error('Purchase missing sale_id for memo', memo);
      return;
    }

    const sale = await loadSaleById(purchase.sale_id);
    if (!sale) {
      console.error('Sale not found for purchase', purchase.id);
      return;
    }

    const tonPaid = toTonAmount(tx.in_msg?.value);
    const expectedTon = sale.priceTon;

    if (Math.abs(tonPaid - expectedTon) > 0.000001) {
      console.warn(`Payment amount mismatch for memo ${memo}: expected ${expectedTon}, got ${tonPaid}`);
      return;
    }

    const accelerate = purchase.accelerate ?? sale.accelerate;
    const taiAmount = accelerate ? sale.maxTai : sale.baseTai;
    const multiplier = accelerate && sale.baseTai > 0 ? sale.maxTai / sale.baseTai : 1;

    const unsignedBoc = buildUnsignedTaiBoc({
      destination: normalizeTonAddress(purchase.wallet_address),
      taiAmount,
      memo,
      saleId: sale.id,
      txHash: tx.transaction_id.hash,
    });

    await markPurchaseAwaitingSignature({
      purchaseId: purchase.id,
      amountTai: taiAmount,
      tonAmount: expectedTon,
      txHash: tx.transaction_id.hash,
      unsignedBoc,
      accelerate: Boolean(accelerate),
      multiplier,
    });

    await recordPurchasePayout({
      saleId: sale.id,
      wallet: purchase.wallet_address,
      taiAmount,
      tonAmount: expectedTon,
    });

    console.log(`✅ TON payment processed for memo ${memo}, purchase ${purchase.id}`);
  }

  private cacheHash(hash: string) {
    this.processedHashes.add(hash);
    if (this.processedHashes.size > MAX_PROCESSED_CACHE) {
      const iterator = this.processedHashes.values();
      const first = iterator.next();
      if (!first.done) {
        this.processedHashes.delete(first.value);
      }
    }
  }
}

let listener: TonPaymentListener | undefined;

export function startTonPaymentListener() {
  if (!listener) {
    listener = new TonPaymentListener();
    listener.start();
  }

  return listener;
}

export function stopTonPaymentListener() {
  listener?.stop();
  listener = undefined;
}
