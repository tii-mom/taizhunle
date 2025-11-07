export {};

declare global {
  interface TelegramWebAppThemeParams {
    accent_color?: string;
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  }

  interface TelegramWebAppMainButton {
    show: () => void;
    hide: () => void;
    setText: (text: string) => void;
    showProgress?: (leaveActive?: boolean) => void;
    hideProgress?: () => void;
    onClick: (handler: () => void) => void;
    offClick: (handler: () => void) => void;
  }

  interface TelegramWebAppBackButton {
    show: () => void;
    hide: () => void;
    onClick: (handler: () => void) => void;
    offClick: (handler: () => void) => void;
  }

  interface TelegramWebAppUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
  }

  interface TelegramWebApp {
    initData: string;
    initDataUnsafe: {
      user?: TelegramWebAppUser;
      chat?: { id: number; type: string };
      start_param?: string;
    };
    ready: () => void;
    expand?: () => void;
    sendData: (data: string) => void;
    MainButton: TelegramWebAppMainButton;
    BackButton?: TelegramWebAppBackButton;
    themeParams?: TelegramWebAppThemeParams;
    colorScheme?: 'light' | 'dark';
    openTelegramLink?: (url: string) => void;
  }

  interface TelegramSDK {
    WebApp?: TelegramWebApp;
  }

  interface Window {
    Telegram?: TelegramSDK;
  }
}
