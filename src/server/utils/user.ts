import { supabase } from '../services/supabaseClient.js';
import { normalizeTonAddress } from './ton.js';

export async function resolveUserId(identifier: string | undefined | null): Promise<string | null> {
  const trimmed = identifier?.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed === 'current_user') {
    const { data } = await supabase
      .from('users')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1);

    return data?.[0]?.id ?? null;
  }

  if (/^[0-9a-fA-F-]{36}$/.test(trimmed)) {
    return trimmed;
  }

  const normalized = normalizeTonAddress(trimmed);
  const { data: walletMatch } = await supabase
    .from('users')
    .select('id')
    .eq('wallet_address', normalized)
    .maybeSingle();

  if (walletMatch?.id) {
    return walletMatch.id;
  }

  const { data: directMatch } = await supabase
    .from('users')
    .select('id')
    .eq('id', trimmed)
    .maybeSingle();

  return directMatch?.id ?? null;
}
