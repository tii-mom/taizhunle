import { beginCell } from '@ton/core';
import { supabase } from './supabaseClient.js';
import { ensureUserByWallet } from './userService.js';
import { notifyAdmins, notifyChannel } from './telegramService.js';
import type { OfficialRainRow } from '../types/database.js';

type NextOfficialRain = {
  id: string;
  nextAt: number;
  remaining: number;
  qualify: boolean;
  ticketPrice: number;
  amountTAI: number;
};

type ClaimOfficialRainRequest = {
  wallet: string;
  telegramId?: number;
  telegramUsername?: string;
};

type ClaimOfficialRainResponse = {
  unsignedBoc: string;
  amount: number;
  qualified: boolean;
  rainId: string;
};

const ACTIVE_STATUSES = new Set(['active', 'scheduled']);

type CreateOfficialRainOptions = {
  amountTai?: number;
  ticketPriceTon?: number;
  minBonus?: number;
  maxBonus?: number;
  maxParticipants?: number;
  durationMinutes?: number;
  status?: 'scheduled' | 'active';
  startAt?: Date;
};

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === 'number') {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getRandomBonus(min: number, max: number): number {
  const minimum = Math.max(0, Math.floor(min));
  const maximum = Math.max(minimum, Math.floor(max));
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

async function loadActiveRain() {
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from('official_rain')
    .select('*')
    .in('status', Array.from(ACTIVE_STATUSES))
    .gte('end_time', nowIso)
    .order('start_time', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load official rain: ${error.message}`);
  }

  return data || null;
}

async function loadFallbackRain() {
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from('official_rain')
    .select('*')
    .order('start_time', { ascending: true })
    .gte('start_time', nowIso)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load next official rain: ${error.message}`);
  }

  return data || null;
}

export async function getActiveRainRecord(): Promise<OfficialRainRow | null> {
  return (await loadActiveRain()) ?? null;
}

export async function createOfficialRainDrop(options: CreateOfficialRainOptions = {}): Promise<OfficialRainRow> {
  const now = options.startAt ?? new Date();
  const durationMinutes = options.durationMinutes ?? 120;
  const end = new Date(now.getTime() + durationMinutes * 60 * 1000);

  const amountTai = options.amountTai ?? 10_000_000;
  const ticketPriceTon = options.ticketPriceTon ?? 0.3;
  const maxParticipants = options.maxParticipants ?? 1000;
  const minBonus = Math.min(
    amountTai,
    Math.max(options.minBonus ?? Math.round(amountTai * 0.02), 100),
  );
  const maxBonus = Math.min(
    amountTai,
    Math.max(options.maxBonus ?? Math.round(amountTai * 0.1), minBonus),
  );

  const payload = {
    amount_tai: amountTai,
    ticket_price_ton: ticketPriceTon,
    min_bonus: minBonus,
    max_bonus: maxBonus,
    total_participants: 0,
    max_participants: maxParticipants,
    total_distributed: 0,
    start_time: now.toISOString(),
    end_time: end.toISOString(),
    status: options.status ?? 'active',
  } satisfies Partial<OfficialRainRow>;

  const { data, error } = await supabase
    .from('official_rain')
    .insert(payload)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Failed to create official rain drop: ${error?.message ?? 'Unknown error'}`);
  }

  return data as OfficialRainRow;
}

export async function getNextOfficialRain(): Promise<NextOfficialRain | null> {
  const rain = (await loadActiveRain()) ?? (await loadFallbackRain());

  if (!rain) {
    return null;
  }

  const remaining = Math.max(0, toNumber(rain.max_participants) - toNumber(rain.total_participants));

  return {
    id: rain.id,
    nextAt: new Date(rain.start_time).getTime(),
    remaining,
    qualify: remaining > 0,
    ticketPrice: toNumber(rain.ticket_price_ton),
    amountTAI: toNumber(rain.amount_tai),
  } satisfies NextOfficialRain;
}

async function hasCompletedRedpacket(wallet: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('redpacket_purchases')
    .select('id')
    .eq('wallet_address', wallet)
    .eq('status', 'completed')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn('Failed to check redpacket purchases:', error.message);
    return false;
  }

  return Boolean(data);
}

async function hasClaimed(rainId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('official_rain_claims')
    .select('id')
    .eq('rain_id', rainId)
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn('Failed to check rain claim:', error.message);
    return false;
  }

  return Boolean(data);
}

export async function claimOfficialRain(
  request: ClaimOfficialRainRequest,
): Promise<ClaimOfficialRainResponse> {
  const rain = await loadActiveRain();

  if (!rain) {
    throw new Error('No active rain available');
  }

  const remaining = Math.max(0, toNumber(rain.max_participants) - toNumber(rain.total_participants));

  if (remaining <= 0) {
    throw new Error('Official rain has reached its participant limit');
  }

  const wallet = request.wallet.trim();
  if (!wallet) {
    throw new Error('Wallet is required');
  }

  const user = await ensureUserByWallet(wallet, {
    telegramId: request.telegramId,
    telegramUsername: request.telegramUsername,
  });

  if (await hasClaimed(rain.id, user.id)) {
    throw new Error('You have already claimed this rain');
  }

  const hasPurchases = await hasCompletedRedpacket(wallet);
  const ticketPrice = toNumber(rain.ticket_price_ton);
  const baseShare = Math.max(0, Math.floor(toNumber(rain.amount_tai) / Math.max(1, toNumber(rain.max_participants))));
  const bonus = getRandomBonus(toNumber(rain.min_bonus), toNumber(rain.max_bonus));
  const amountReceived = baseShare + bonus;

  const { error: insertError } = await supabase
    .from('official_rain_claims')
    .insert({
      rain_id: rain.id,
      user_id: user.id,
      has_purchased_redpacket: hasPurchases,
      has_channel_activity: Boolean(request.telegramId),
      ticket_paid_ton: ticketPrice,
      amount_received_tai: amountReceived,
      bonus_amount: bonus,
    });

  if (insertError) {
    throw new Error(`Failed to create rain claim: ${insertError.message}`);
  }

  const updatedParticipants = toNumber(rain.total_participants) + 1;
  const updatedDistributed = toNumber(rain.total_distributed) + amountReceived;
  const status = updatedParticipants >= toNumber(rain.max_participants) ? 'completed' : rain.status;

  const { error: updateError } = await supabase
    .from('official_rain')
    .update({
      total_participants: updatedParticipants,
      total_distributed: updatedDistributed,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', rain.id);

  if (updateError) {
    console.warn('Failed to update rain stats:', updateError.message);
  }

  const unsignedBoc = beginCell()
    .storeUint(0x4f52414e, 32) // 'ORAN'
    .storeStringTail(`${rain.id}|${wallet}|${amountReceived}|${ticketPrice}`)
    .endCell()
    .toBoc({ idx: false })
    .toString('base64');

  const message = `🌧️ *官方雨露领取*\n\n• 用户: ${shortenWallet(wallet)}\n• 金额: *${amountReceived.toLocaleString()} TAI*`;

  await Promise.all([
    notifyAdmins(message),
    notifyChannel(message),
  ]);

  return {
    unsignedBoc,
    amount: amountReceived,
    qualified: hasPurchases,
    rainId: rain.id,
  } satisfies ClaimOfficialRainResponse;
}

function shortenWallet(wallet: string): string {
  if (!wallet) {
    return 'anon';
  }

  if (wallet.length <= 10) {
    return wallet;
  }

  return `${wallet.slice(0, 4)}…${wallet.slice(-4)}`;
}
