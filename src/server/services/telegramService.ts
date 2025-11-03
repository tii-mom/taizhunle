type SendOptions = {
  parseMode?: 'Markdown' | 'HTML';
};

const TELEGRAM_BASE_URL = 'https://api.telegram.org';

function getBotToken(): string | null {
  const token = process.env.TELEGRAM_ADMIN_BOT_TOKEN;
  if (!token || token.includes('test') || token.includes('placeholder')) {
    return null;
  }
  return token;
}

async function callTelegramApi(path: string, payload: Record<string, unknown>): Promise<void> {
  const token = getBotToken();
  if (!token) {
    return;
  }

  try {
    const url = `${TELEGRAM_BASE_URL}/bot${token}/${path}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      console.warn(`Telegram API responded with ${response.status}: ${body}`);
    }
  } catch (error) {
    console.error('Failed to call Telegram API:', error);
  }
}

export async function sendTelegramMessage(chatId: string | number, text: string, options: SendOptions = {}): Promise<void> {
  if (!chatId || !text) {
    return;
  }

  await callTelegramApi('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: options.parseMode ?? 'Markdown',
    disable_web_page_preview: true,
  });
}

export async function notifyAdmins(message: string): Promise<void> {
  const adminIds = process.env.TELEGRAM_ADMIN_IDS
    ?.split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  if (!adminIds || adminIds.length === 0) {
    return;
  }

  await Promise.all(adminIds.map((adminId) => sendTelegramMessage(adminId, message)));
}

export async function notifyChannel(message: string): Promise<void> {
  const channelId = process.env.TELEGRAM_CHANNEL_ID;
  if (!channelId) {
    return;
  }

  await sendTelegramMessage(channelId, message);
}
