import { useEffect, useState } from 'react';

interface TelegramUserPayload {
  first_name?: string;
  last_name?: string;
  username?: string;
}

interface TelegramApi {
  WebApp?: {
    initDataUnsafe?: {
      user?: TelegramUserPayload;
    };
  };
}

export function useTelegramUser() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const telegram = (window as unknown as { Telegram?: TelegramApi }).Telegram;
    const payload = telegram?.WebApp?.initDataUnsafe?.user;

    if (!payload) {
      setName(null);
      return;
    }

    const fullName = [payload.first_name, payload.last_name]
      .filter(Boolean)
      .join(' ') || payload.username;

    setName(fullName ?? null);
  }, []);

  return name;
}
