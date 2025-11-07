import cron from 'node-cron';
import config from '../../config/env.js';
import { supabase } from '../services/supabaseClient.js';
import type { Database } from '../../types/supabase.js';

type RedpacketSaleRow = Database['public']['Tables']['redpacket_sales']['Row'];
type RedpacketSaleInsert = Database['public']['Tables']['redpacket_sales']['Insert'];

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

async function adjustRedpacketPrice() {
  const now = new Date();
  const nowIso = now.toISOString();

  const { data: previousSalesRaw, error: previousError } = await supabase
    .from('redpacket_sales')
    .select('*')
    .lt('expires_at', nowIso)
    .order('expires_at', { ascending: false })
    .limit(1);
  const previousSales = previousSalesRaw as RedpacketSaleRow[] | null;
  const previousSale: RedpacketSaleRow | undefined = previousSales?.[0];

  if (previousError) {
    throw new Error(`Failed to load previous sale: ${previousError.message}`);
  }

  if (!previousSale) {
    console.warn('No previous sale found for price adjustment');
    return;
  }

  const soldTai = toNumber(previousSale.sold_tai);

  let adjustment = 0;
  if (soldTai < 500_000) {
    adjustment = -30;
  } else if (soldTai < 800_000) {
    adjustment = 0;
  } else if (soldTai < 950_000) {
    adjustment = 30;
  } else {
    adjustment = 50;
  }

  const previousPrice = toNumber(previousSale.price_ton) || config.business.redpacket.priceTon || 9.99;
  const multiplier = 1 + adjustment / 100;
  const newPrice = Number((previousPrice * multiplier).toFixed(6));

  const baseTai = toNumber(previousSale.base_tai) || config.business.redpacket.baseAmount || 700_000;
  const maxTai = toNumber(previousSale.max_tai) || config.business.redpacket.maxAmount || 1_300_000;
  const totalTai = toNumber(previousSale.total_tai) || Math.round(baseTai / 0.7);

  const saleCode = formatSaleCode(now);
  const startAt = new Date(now);
  startAt.setUTCHours(0, 0, 0, 0);
  const expiresAt = new Date(startAt);
  expiresAt.setUTCHours(23, 59, 59, 0);

  const { data: existingSaleRaw, error: existingError } = await supabase
    .from('redpacket_sales')
    .select('id, sold_tai')
    .eq('sale_code', saleCode)
    .limit(1);
  const existingSale = existingSaleRaw as Pick<RedpacketSaleRow, 'id' | 'sold_tai'>[] | null;

  if (existingError) {
    throw new Error(`Failed to check current sale: ${existingError.message}`);
  }

  const payload: RedpacketSaleInsert = {
    sale_code: saleCode,
    price_ton: newPrice,
    base_tai: baseTai,
    max_tai: maxTai,
    total_tai: totalTai,
    sold_tai: 0,
    sold_out: false,
    accelerate: false,
    accelerate_rate: previousSale.accelerate_rate ?? 0,
    price_adjustment: adjustment,
    price_adjusted_at: nowIso,
    memo_prefix: previousSale.memo_prefix ?? 'RP',
    start_at: startAt.toISOString(),
    expires_at: expiresAt.toISOString(),
  };

  if (existingSale?.length) {
    const existing = existingSale[0];
    if (toNumber(existing.sold_tai) > 0) {
      console.log('ℹ️ Today sale already active, skipping price update');
      return;
    }

    const redpacketSalesTable = supabase.from('redpacket_sales') as any;
    const { error: updateError } = await redpacketSalesTable
      .update({
        ...payload,
      })
      .eq('id', existing.id);

    if (updateError) {
      throw new Error(`Failed to update sale for today: ${updateError.message}`);
    }

    console.log(`✅ Updated today sale price to ${newPrice} TON (adjustment ${adjustment}%)`);
    return;
  }

  const redpacketSalesTable = supabase.from('redpacket_sales') as any;
  const { error: insertError } = await redpacketSalesTable.insert(payload);

  if (insertError) {
    throw new Error(`Failed to create sale for today: ${insertError.message}`);
  }

  console.log(`✅ Created new sale for ${saleCode} with price ${newPrice} TON (adjustment ${adjustment}%)`);
}

// Run daily at 00:00
export function startPriceAdjustJob() {
  cron.schedule('0 0 * * *', async () => {
    if (!config.features.priceAdjustment) {
      console.log('ℹ️ Price adjustment feature disabled');
      return;
    }

    console.log('🔄 Running price adjustment job...');

    try {
      await adjustRedpacketPrice();
      console.log('📢 Price adjustment job completed');
    } catch (error) {
      console.error('❌ Price adjustment job failed:', error);
    }
  });

  console.log('⏰ Price adjustment job scheduled (daily at 00:00)');
}
