import { Bot, InlineKeyboard, webhookCallback } from 'grammy';
import type { ExecutionContext, ScheduledController } from '@cloudflare/workers-types';
import { handleCrowdNotifications } from './notify';

interface Env {
  BOT_TOKEN: string;
  WEB_APP_URL: string;
  MINIAPP_DEEP_LINK?: string;
  CROWD_SHARE_HOST?: string;
}

let cachedBot: Bot<Env> | null = null;

function createBot(env: Env) {
  const bot = new Bot<Env>(env.BOT_TOKEN);

  bot.command('start', ctx => {
    const url = env.MINIAPP_DEEP_LINK ?? env.WEB_APP_URL;
    const keyboard = new InlineKeyboard().webApp('立即预测', url);
    return ctx.reply('👋 0 注册，1 键预测！', { reply_markup: keyboard });
  });

  bot.on('message', async ctx => {
    const payload = ctx.message?.web_app_data?.data;
    if (!payload) {
      return;
    }

    try {
      const data = JSON.parse(payload) as Record<string, unknown>;
      if (data.event === 'bet-confirmed') {
        const amount = data.amount ?? '未知';
        const keyboard = new InlineKeyboard().webApp('再玩一次', env.MINIAPP_DEEP_LINK ?? env.WEB_APP_URL);
        await ctx.reply(`✅ 已收到下注：${amount} TAI`, { reply_markup: keyboard });
        return;
      }

      if (data.event === 'crowd-nearly-full' && typeof data.crowdUrl === 'string') {
        const keyboard = new InlineKeyboard().url('邀请最后 1 人 ⚡️', data.crowdUrl);
        await ctx.reply('⚡️ 闪电团只差 1 人，快邀请好友！', { reply_markup: keyboard });
      }
    } catch (error) {
      console.error('Failed to parse WebApp payload', error);
    }
  });

  return bot;
}

function getBot(env: Env) {
  if (!cachedBot) {
    cachedBot = createBot(env);
  }
  return cachedBot;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const bot = getBot(env);
    const callback = webhookCallback(bot, 'cloudflare');
    return callback(request);
  },
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(handleCrowdNotifications(env));
  },
};
