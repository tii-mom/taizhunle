import { randomBytes } from 'crypto';
import { supabase } from './supabaseClient.js';
import { toNumber } from '../utils/number.js';

function createInviteCode(userId: string): string {
  return `TAI-${userId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'MEMBER'}`;
}

export async function fetchInviteStats(userId: string) {
  const { data, error } = await supabase
    .from('dao_pool')
    .select('amount, status, wallet_address')
    .eq('pool_type', 'invite')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to load invite stats: ${error.message}`);
  }

  const entries = data ?? [];
  const totalInvites = entries.length;
  const activeTraders = new Set(entries.map(entry => entry.wallet_address).filter(Boolean)).size;
  const pendingEarnings = entries
    .filter(entry => entry.status === 'pending')
    .reduce((sum, entry) => sum + toNumber(entry.amount), 0);
  const totalEarnings = entries.reduce((sum, entry) => sum + toNumber(entry.amount), 0);

  return {
    totalInvites,
    activeTraders,
    pendingEarnings,
    totalEarnings,
    inviteCode: createInviteCode(userId),
    gasFee: 0.05,
  };
}

export async function fetchInviteFunnel(userId: string) {
  const { data, error } = await supabase
    .from('bets')
    .select('id, user_id, amount, referrer_reward')
    .eq('referrer_id', userId);

  if (error) {
    throw new Error(`Failed to load invite funnel: ${error.message}`);
  }

  const entries = data ?? [];
  const registrations = new Set(entries.map(entry => entry.user_id).filter(Boolean)).size;
  const bets = entries.length;
  const earnings = entries.reduce((sum, entry) => sum + toNumber(entry.referrer_reward), 0);
  const clicks = registrations + Math.max(bets, registrations);

  return {
    clicks,
    registrations,
    bets,
    earnings,
  };
}

export async function fetchInviteGasFee(userId: string) {
  const stats = await fetchInviteStats(userId);
  return { gasFee: stats.gasFee ?? 0.05 };
}

export async function claimInviteRewards(userId: string) {
  const { data, error } = await supabase
    .from('dao_pool')
    .select('id, amount')
    .eq('pool_type', 'invite')
    .eq('user_id', userId)
    .eq('status', 'pending');

  if (error) {
    throw new Error(`Failed to fetch pending invite rewards: ${error.message}`);
  }

  const pending = data ?? [];
  if (pending.length === 0) {
    return {
      success: true,
      amount: 0,
      gasFee: 0.05,
      txHash: null,
    };
  }

  const totalAmount = pending.reduce((sum, record) => sum + toNumber(record.amount), 0);
  const txHash = `0x${randomBytes(16).toString('hex')}`;

  const { error: updateError } = await supabase
    .from('dao_pool')
    .update({
      status: 'claimed',
      claimed_at: new Date().toISOString(),
      tx_hash: txHash,
    })
    .in('id', pending.map(record => record.id));

  if (updateError) {
    throw new Error(`Failed to claim invite rewards: ${updateError.message}`);
  }

  return {
    success: true,
    amount: totalAmount,
    gasFee: 0.05,
    txHash,
  };
}
