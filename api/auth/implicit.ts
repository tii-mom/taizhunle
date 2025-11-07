import { createClient } from '@supabase/supabase-js';
import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  BOT_TOKEN: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  MINIAPP_JWT_SECRET: string;
}

interface TelegramInitData {
  user: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  };
  chat?: { id: number; type: string };
  start_param?: string;
  auth_date: number;
}

async function verifyTelegramInitData(initData: string, botToken: string): Promise<TelegramInitData | null> {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) {
    return null;
  }

  const dataEntries = Array.from(params.entries())
    .filter(([key]) => key !== 'hash')
    .sort((a, b) => a[0].localeCompare(b[0]));
  const dataCheckString = dataEntries.map(([key, value]) => `${key}=${value}`).join('\n');
  const secret = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(`WebAppData${botToken}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', secret, new TextEncoder().encode(dataCheckString));
  const hex = Array.from(new Uint8Array(signature))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');

  if (hex !== hash) {
    return null;
  }

  const userRaw = params.get('user');
  if (!userRaw) {
    return null;
  }

  const authDate = Number(params.get('auth_date'));

  return {
    user: JSON.parse(userRaw) as TelegramInitData['user'],
    chat: params.get('chat') ? (JSON.parse(params.get('chat')!) as TelegramInitData['chat']) : undefined,
    start_param: params.get('start_param') ?? undefined,
    auth_date: Number.isFinite(authDate) ? authDate : Math.floor(Date.now() / 1000),
  };
}

async function signJwt(secret: string, payload: Record<string, unknown>) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = {
    iat: now,
    exp: now + 3600 * 24,
    ...payload,
  };

  const encoder = new TextEncoder();
  const base64url = (input: string) =>
    btoa(input)
      .replace(/=+$/u, '')
      .replace(/\+/gu, '-')
      .replace(/\//gu, '_');

  const headerEncoded = base64url(JSON.stringify(header));
  const bodyEncoded = base64url(JSON.stringify(body));
  const data = `${headerEncoded}.${bodyEncoded}`;
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const signatureEncoded = base64url(String.fromCharCode(...new Uint8Array(signature)));
  return `${data}.${signatureEncoded}`;
}

export const onRequestPost: PagesFunction<Env> = async context => {
  const { request, env } = context;
  const { BOT_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_KEY, MINIAPP_JWT_SECRET } = env;

  if (!BOT_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_KEY || !MINIAPP_JWT_SECRET) {
    return new Response('Missing env configuration', { status: 500 });
  }

  const body = (await request.json()) as { initData?: string; wallet?: string };
  if (!body.initData || !body.wallet) {
    return new Response('Invalid request body', { status: 400 });
  }

  const initData = await verifyTelegramInitData(body.initData, BOT_TOKEN);
  if (!initData) {
    return new Response('Bad Telegram signature', { status: 401 });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now - initData.auth_date > 600) {
    return new Response('Telegram signature expired', { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
    global: { fetch },
  });

  const tgUser = initData.user;

  const { data: existingUsers, error: selectError } = await supabase
    .from('users')
    .select('id, wallet_address')
    .eq('telegram_id', tgUser.id)
    .limit(1);

  if (selectError) {
    console.error('Failed to load user', selectError);
    return new Response('Failed to load user', { status: 500 });
  }

  let userId: string | null = existingUsers?.[0]?.id ?? null;

  if (!userId) {
    const { data: walletOwners, error: walletError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', body.wallet)
      .limit(1);

    if (walletError) {
      console.error('Wallet select failed', walletError);
      return new Response('Failed to select wallet', { status: 500 });
    }

    if (walletOwners && walletOwners.length > 0 && walletOwners[0]?.id) {
      return new Response('Wallet already linked', { status: 409 });
    }

    const { data: inserted, error: insertError } = await supabase
      .from('users')
      .insert({
        wallet_address: body.wallet,
        telegram_id: tgUser.id,
        telegram_username: tgUser.username ?? null,
        first_name: tgUser.first_name ?? null,
        last_name: tgUser.last_name ?? null,
        language_code: tgUser.language_code ?? 'zh',
      })
      .select('id')
      .single();

    if (insertError || !inserted) {
      console.error('Failed to insert user', insertError);
      return new Response('Failed to create user', { status: 500 });
    }

    userId = inserted.id;
  } else {
    const { error: updateError } = await supabase
      .from('users')
      .update({
        wallet_address: body.wallet,
        telegram_username: tgUser.username ?? null,
        first_name: tgUser.first_name ?? null,
        last_name: tgUser.last_name ?? null,
        language_code: tgUser.language_code ?? 'zh',
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update user', updateError);
      return new Response('Failed to update user', { status: 500 });
    }
  }

  const sessionPayload = {
    telegram_id: tgUser.id,
    wallet: body.wallet,
    user_id: userId,
  };

  const token = await signJwt(MINIAPP_JWT_SECRET, sessionPayload);

  const sessionUpsert = await supabase
    .from('miniapp_sessions')
    .upsert(
      {
        telegram_id: tgUser.id,
        user_id: userId,
        ton_wallet: body.wallet,
        chat_id: initData.chat?.id ?? null,
        chat_type: initData.chat?.type ?? null,
        start_param: initData.start_param ?? null,
        last_active_at: new Date().toISOString(),
      },
      { onConflict: 'telegram_id' },
    )
    .select('id')
    .single();

  if (sessionUpsert.error) {
    console.error('Failed to upsert session', sessionUpsert.error);
    return new Response('Failed to persist session', { status: 500 });
  }

  return Response.json({ jwt: token, sessionId: sessionUpsert.data.id });
};
