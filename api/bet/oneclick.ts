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

interface JwtPayload {
  telegram_id: number;
  wallet: string;
  user_id: string;
  exp: number;
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
  const normalizedSignature = signatureB64.replace(/-/gu, '+').replace(/_/gu, '/');
  const signaturePad = normalizedSignature.length % 4;
  const signature = normalizedSignature + (signaturePad === 0 ? '' : '='.repeat(4 - signaturePad));
  const signatureBuffer = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
  const verified = await crypto.subtle.verify('HMAC', key, signatureBuffer, encoder.encode(`${headerB64}.${payloadB64}`));
  if (!verified) {
    return null;
  }
  const normalizedPayload = payloadB64.replace(/-/gu, '+').replace(/_/gu, '/');
  const payloadPad = normalizedPayload.length % 4;
  const payloadBase64 = normalizedPayload + (payloadPad === 0 ? '' : '='.repeat(4 - payloadPad));
  const payloadJson = atob(payloadBase64);
  const parsedPayload = JSON.parse(payloadJson) as JwtPayload;
  if (parsedPayload.exp * 1000 < Date.now()) {
    return null;
  }
  return parsedPayload;
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
  const token = authHeader.slice('Bearer '.length);
  const payload = await verifyJwt(token, MINIAPP_JWT_SECRET);
  if (!payload) {
    return new Response('Invalid token', { status: 401 });
  }

  const { initData, wallet, tx, marketId, selection, amountTai, crowdCode } = (await request.json()) as {
    initData?: string;
    wallet?: string;
    tx?: string | null;
    marketId?: string;
    selection?: string;
    amountTai?: number;
    crowdCode?: string | null;
  };

  if (!initData || !wallet || !marketId || !selection || !amountTai) {
    return new Response('Missing parameters', { status: 400 });
  }

  const init = await verifyTelegramInitData(initData, BOT_TOKEN);
  if (!init || init.user.id !== payload.telegram_id) {
    return new Response('Telegram verification failed', { status: 401 });
  }

  if (wallet !== payload.wallet) {
    return new Response('Wallet mismatch', { status: 403 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
    global: { fetch },
  });

  const { data: session, error: sessionError } = await supabase
    .from('miniapp_sessions')
    .select('id')
    .eq('telegram_id', payload.telegram_id)
    .single();

  if (sessionError || !session) {
    console.error('Session not found', sessionError);
    return new Response('Session not found', { status: 404 });
  }

  const insertResult = await supabase
    .from('miniapp_oneclick_bets')
    .insert({
      session_id: session.id,
      user_id: payload.user_id,
      market_id: marketId,
      selection,
      amount_tai: amountTai,
      ton_wallet: wallet,
      telegram_user_id: payload.telegram_id,
      ton_tx_boc: tx ?? null,
      status: 'pending',
    })
    .select('id')
    .single();

  if (insertResult.error || !insertResult.data) {
    console.error('Failed to insert bet', insertResult.error);
    return new Response('Failed to record bet', { status: 500 });
  }

  let crowdUrl: string | undefined;

  if (crowdCode) {
    const { data: crowd, error: crowdError } = await supabase
      .from('miniapp_flash_crowds')
      .select('id, share_code, target_size, status')
      .eq('share_code', crowdCode)
      .single();

    if (!crowdError && crowd) {
      await supabase
        .from('miniapp_flash_crowd_members')
        .upsert(
          {
            flash_crowd_id: crowd.id,
            session_id: session.id,
            telegram_user_id: payload.telegram_id,
          },
          { onConflict: 'flash_crowd_id,session_id' },
        );

      const membersCount = await supabase
        .from('miniapp_flash_crowd_members')
        .select('id', { head: true, count: 'exact' })
        .eq('flash_crowd_id', crowd.id);

      if (!membersCount.error && typeof membersCount.count === 'number') {
        const statusUpdate: Record<string, unknown> = { last_fill_count: membersCount.count };
        if (membersCount.count >= crowd.target_size) {
          statusUpdate.status = 'full';
        } else if (crowd.status === 'open' && membersCount.count > 0) {
          statusUpdate.status = 'filling';
        }
        await supabase
          .from('miniapp_flash_crowds')
          .update(statusUpdate)
          .eq('id', crowd.id);
      }

      crowdUrl = buildCrowdShareUrl(env, crowd.share_code);
    }
  }

  return Response.json({ betId: insertResult.data.id, crowdUrl });
};
