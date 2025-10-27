import TelegramBot from 'node-telegram-bot-api';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const ADMIN_IDS = (process.env.TELEGRAM_ADMIN_IDS || '').split(',').map(Number);

let bot: TelegramBot | null = null;

export function startTelegramBot() {
  if (!BOT_TOKEN) {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN not set, bot disabled');
    return;
  }

  bot = new TelegramBot(BOT_TOKEN, { polling: true });

  // Command: /price
  bot.onText(/\/price/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    if (!userId || !ADMIN_IDS.includes(userId)) {
      await bot?.sendMessage(chatId, '❌ Admin only command');
      return;
    }

    // TODO: Fetch current price
    await bot?.sendMessage(chatId, '💰 Current price: 9.99 TON');
  });

  // Command: /accelerate
  bot.onText(/\/accelerate/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    if (!userId || !ADMIN_IDS.includes(userId)) {
      await bot?.sendMessage(chatId, '❌ Admin only command');
      return;
    }

    // TODO: Check acceleration status
    await bot?.sendMessage(chatId, '⚡ Acceleration: 5% → 10% (20:00-24:00)');
  });

  // Command: /soldout
  bot.onText(/\/soldout/, async (msg) => {
    const chatId = msg.chat.id;

    // TODO: Check sold out status
    await bot?.sendMessage(chatId, '📦 Status: 750,000 / 1,000,000 TAI sold');
  });

  // Command: /next
  bot.onText(/\/next/, async (msg) => {
    const chatId = msg.chat.id;

    // TODO: Fetch next official rain time
    await bot?.sendMessage(chatId, '🎁 Next official rain: 14:00');
  });

  console.log('🤖 Telegram bot started');
}

export function sendChannelNotification(message: string) {
  const channelId = process.env.TELEGRAM_CHANNEL_ID;
  if (!bot || !channelId) {
    console.warn('⚠️ Cannot send notification: bot or channel not configured');
    return;
  }

  bot.sendMessage(channelId, message).catch((error) => {
    console.error('❌ Failed to send channel notification:', error);
  });
}
