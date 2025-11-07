import { createClient, type SupabaseClient } from '@supabase/supabase-js';

interface Env {
  BOT_TOKEN: string;
  WEB_APP_URL: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  MINIAPP_DEEP_LINK?: string;
  CROWD_SHARE_HOST?: string;
}

interface CrowdRecord {
  id: string;
  share_code: string;
  target_size: number;
  notify_chat_id: string | null;
  notify_message_id: number | null;
  last_notified_at: string | null;
  market_id: string | null;
  status: string;
  members?: Array<{ count: number }>;
}

function createSupabase(env: Env): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
    global: { fetch },
  });
}

function shouldNotify(record: CrowdRecord) {
  if (record.status !== 'open' || !record.notify_chat_id) {
    return false;
  }
  const count = record.members?.[0]?.count ?? 0;
  if (record.target_size - count !== 1) {
    return false;
  }
  if (!record.last_notified_at) {
    return true;
  }
  const last = new Date(record.last_notified_at).getTime();
  return Date.now() - last > 60_000; // notify at most once per minute
}

function buildShareUrl(env: Env, shareCode: string) {
  if (env.CROWD_SHARE_HOST) {
    const url = new URL(`/crowd/${shareCode}`, env.CROWD_SHARE_HOST);
    return url.toString();
  }
  const base = env.MINIAPP_DEEP_LINK ?? env.WEB_APP_URL;
  const url = new URL(base);
  url.searchParams.set('crowd', shareCode);
  return url.toString();
}

async function notifyNearlyFull(env: Env, crowd: CrowdRecord, supabase: SupabaseClient) {
  const shareUrl = buildShareUrl(env, crowd.share_code);
  const text = `⚡️ 闪电团 😱 只差 1 人满员\n市场：${crowd.market_id ?? '即刻预测'}\n点击加入立刻锁定红包`; // short enough for TG
  const keyboard = {
    inline_keyboard: [
      [
        {
          text: '立即补位 ⚡️',
          url: shareUrl,
        },
      ],
    ],
  };

  const response = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: crowd.notify_chat_id,
      text,
      reply_markup: keyboard,
    }),
  });

  if (!response.ok) {
    console.error('Failed to notify crowd', await response.text());
    return;
  }

  const result = (await response.json()) as { ok: boolean; result?: { message_id?: number } };

  const updates: Record<string, unknown> = {
    last_notified_at: new Date().toISOString(),
  };
  if (result.ok && result.result?.message_id) {
    updates.notify_message_id = result.result.message_id;
  }

  await supabase.from('miniapp_flash_crowds').update(updates).eq('id', crowd.id);
}

export async function handleCrowdNotifications(env: Env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    console.warn('Skipping crowd notification: missing Supabase credentials');
    return;
  }

  const supabase = createSupabase(env);
  const { data, error } = await supabase
    .from('miniapp_flash_crowds')
    .select('id, share_code, target_size, notify_chat_id, notify_message_id, last_notified_at, market_id, status, members:miniapp_flash_crowd_members(count)')
    .in('status', ['open', 'filling']);

  if (error) {
    console.error('Failed to load crowds', error);
    return;
  }

  if (!data || data.length === 0) {
    return;
  }

  await Promise.all(
    data
      .filter(shouldNotify)
      .map(record => notifyNearlyFull(env, record as CrowdRecord, supabase)),
  );
}
