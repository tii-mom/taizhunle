import { createClient } from '@supabase/supabase-js';
import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  BOT_TOKEN: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  MINIAPP_JWT_SECRET: string;
  WEB_APP_URL: string;
  MINIAPP_DEEP_LINK?: string;
  CROWD_SHARE_HOST?: string;
}

interface TelegramInitData {
  user: {
    id: number;
    first_name: string;
    username?: string;
  };
  chat?: { id: number; type: string };
  start_param?: string;
  auth_date: number;
}

interface JwtPayload {
  telegram_id: number;
  wallet: string;
  user_id: string;
  exp: number;
}

async function verifyTelegramInitData(initData: string, botToken: string): Promise<TelegramInitData | null> {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) {
    return null;
  }
  const sorted = Array.from(params.entries())
    .filter(([key]) => key !== 'hash')
    .sort((a, b) => a[0].localeCompare(b[0]));
  const checkString = sorted.map(([key, value]) => `${key}=${value}`).join('\n');
  const secret = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(`WebAppData${botToken}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const digest = await crypto.subtle.sign('HMAC', secret, new TextEncoder().encode(checkString));
  const hex = Array.from(new Uint8Array(digest))
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

async function verifyJwt(token: string, secret: string): Promise<JwtPayload | null> {
  const [headerB64, payloadB64, signatureB64] = token.split('.');
  if (!headerB64 || !payloadB64 || !signatureB64) {
    return null;
  }
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  const normalize = (value: string) => {
    const base = value.replace(/-/gu, '+').replace(/_/gu, '/');
    const pad = base.length % 4;
    return base + (pad === 0 ? '' : '='.repeat(4 - pad));
  };
  const signatureBuffer = Uint8Array.from(atob(normalize(signatureB64)), c => c.charCodeAt(0));
  const verified = await crypto.subtle.verify('HMAC', key, signatureBuffer, encoder.encode(`${headerB64}.${payloadB64}`));
  if (!verified) {
    return null;
  }
  const payloadJson = atob(normalize(payloadB64));
  const payload = JSON.parse(payloadJson) as JwtPayload;
  if (payload.exp * 1000 < Date.now()) {
    return null;
  }
  return payload;
}

function buildCrowdShareUrl(env: Env, shareCode: string) {
  if (env.CROWD_SHARE_HOST) {
    const url = new URL(`/crowd/${shareCode}`, env.CROWD_SHARE_HOST);
    return url.toString();
  }
  const base = env.MINIAPP_DEEP_LINK ?? env.WEB_APP_URL;
  const url = new URL(base);
  url.searchParams.set('crowd', shareCode);
  return url.toString();
}

function randomShareCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { BOT_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_KEY, MINIAPP_JWT_SECRET } = env;
  if (!BOT_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_KEY || !MINIAPP_JWT_SECRET) {
    return new Response('Missing env configuration', { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 });
  }
  const jwt = await verifyJwt(authHeader.slice(7), MINIAPP_JWT_SECRET);
  if (!jwt) {
    return new Response('Invalid token', { status: 401 });
  }

  const { initData, wallet, marketId, targetSize, amountTai } = (await request.json()) as {
    initData?: string;
    wallet?: string;
    marketId?: string;
    targetSize?: number;
    amountTai?: number;
  };

  if (!initData || !wallet || !marketId) {
    return new Response('Missing parameters', { status: 400 });
  }

  const init = await verifyTelegramInitData(initData, BOT_TOKEN);
  if (!init || init.user.id !== jwt.telegram_id) {
    return new Response('Telegram verification failed', { status: 401 });
  }

  if (wallet !== jwt.wallet) {
    return new Response('Wallet mismatch', { status: 403 });
  }

  const size = Number.isFinite(targetSize) && targetSize ? Math.max(3, Math.min(50, targetSize)) : 5;
  const stake = Number.isFinite(amountTai) && amountTai ? Math.max(0, amountTai) : 0;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
    global: { fetch },
  });

  const { data: session, error: sessionError } = await supabase
    .from('miniapp_sessions')
    .select('id')
    .eq('telegram_id', jwt.telegram_id)
    .single();

  if (sessionError || !session) {
    console.error('Session not found', sessionError);
    return new Response('Session not found', { status: 404 });
  }

  let shareCode = randomShareCode();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data: existing } = await supabase
      .from('miniapp_flash_crowds')
      .select('id')
      .eq('share_code', shareCode)
      .maybeSingle();
    if (!existing) {
      break;
    }
    shareCode = randomShareCode();
  }

  const { data: crowd, error: crowdError } = await supabase
    .from('miniapp_flash_crowds')
    .insert({
      share_code: shareCode,
      owner_session_id: session.id,
      market_id: marketId,
      target_size: size,
      stake_amount_tai: stake,
      telegram_user_id: jwt.telegram_id,
      notify_chat_id: init.chat?.id ?? null,
      notify_chat_type: init.chat?.type ?? null,
      start_param: init.start_param ?? null,
      status: 'open',
    })
    .select('id, share_code')
    .single();

  if (crowdError || !crowd) {
    console.error('Failed to create crowd', crowdError);
    return new Response('Failed to create crowd', { status: 500 });
  }

  await supabase
    .from('miniapp_flash_crowd_members')
    .upsert(
      {
        flash_crowd_id: crowd.id,
        session_id: session.id,
        telegram_user_id: jwt.telegram_id,
        is_owner: true,
      },
      { onConflict: 'flash_crowd_id,session_id' },
    );

  const shareUrl = buildCrowdShareUrl(env, crowd.share_code);

  return Response.json({
    crowdCode: crowd.share_code,
    shareUrl,
    targetSize: size,
  });
};
