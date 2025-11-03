import { supabase } from './supabaseClient.js';
import type { UserRow } from '../types/database.js';

type EnsureUserOptions = {
  telegramId?: number | null;
  telegramUsername?: string | null;
  languageCode?: string | null;
};

function parseTelegramId(value?: number | string | null): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export async function ensureUserByWallet(
  walletAddress: string,
  options: EnsureUserOptions = {},
): Promise<UserRow> {
  const trimmedWallet = walletAddress.trim();

  if (!trimmedWallet) {
    throw new Error('Wallet address is required');
  }

  const { data: existing, error } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', trimmedWallet)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load user by wallet: ${error.message}`);
  }

  const telegramId = parseTelegramId(options.telegramId);
  const telegramUsername = options.telegramUsername?.trim() || null;
  const languageCode = options.languageCode?.trim() || 'zh';

  if (existing) {
    const needsUpdate =
      (telegramId && !existing.telegram_id) ||
      (telegramUsername && !existing.telegram_username) ||
      (languageCode && existing.language_code !== languageCode);

    if (needsUpdate) {
      const { data: updated, error: updateError } = await supabase
        .from('users')
        .update({
          telegram_id: telegramId ?? existing.telegram_id,
          telegram_username: telegramUsername ?? existing.telegram_username,
          language_code: languageCode ?? existing.language_code,
          is_active: true,
        })
        .eq('id', existing.id)
        .select('*')
        .single();

      if (updateError || !updated) {
        throw new Error(`Failed to update user profile: ${updateError?.message ?? 'Unknown error'}`);
      }

      return updated as UserRow;
    }

    return existing as UserRow;
  }

  const { data: inserted, error: insertError } = await supabase
    .from('users')
    .insert({
      wallet_address: trimmedWallet,
      telegram_id: telegramId,
      telegram_username: telegramUsername,
      language_code: languageCode ?? 'zh',
      is_active: true,
    })
    .select('*')
    .single();

  if (insertError || !inserted) {
    throw new Error(`Failed to create user: ${insertError?.message ?? 'Unknown error'}`);
  }

  return inserted as UserRow;
}

export async function incrementUserStats(userId: string, betAmount: number): Promise<void> {
  const { error } = await supabase.rpc('increment_user_bets', {
    p_user_id: userId,
    p_amount: betAmount,
  });

  if (error && error.code !== 'PGRST204') {
    // 忽略函数不存在错误，后续迁移可补充
    console.warn('increment_user_bets RPC failed:', error.message);
  }
}
