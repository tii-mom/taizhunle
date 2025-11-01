/**
 * Telegram WebApp SDK Hook
 * 用于获取 Telegram 用户信息和 WebApp 功能
 */

import { useState, useEffect } from 'react';

// Telegram WebApp 类型定义
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    chat?: {
      id: number;
      type: string;
      title?: string;
      username?: string;
    };
    start_param?: string;
    auth_date: number;
    hash: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  
  // 方法
  ready(): void;
  expand(): void;
  close(): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
  showPopup(params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text: string;
    }>;
  }, callback?: (buttonId: string) => void): void;
  showScanQrPopup(params: {
    text?: string;
  }, callback?: (text: string) => boolean): void;
  closeScanQrPopup(): void;
  readTextFromClipboard(callback?: (text: string) => void): void;
  requestWriteAccess(callback?: (granted: boolean) => void): void;
  requestContact(callback?: (granted: boolean, contact?: any) => void): void;
  
  // 事件
  onEvent(eventType: string, eventHandler: () => void): void;
  offEvent(eventType: string, eventHandler: () => void): void;
  
  // 主按钮
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText(text: string): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    showProgress(leaveActive?: boolean): void;
    hideProgress(): void;
    setParams(params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }): void;
  };
  
  // 返回按钮
  BackButton: {
    isVisible: boolean;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    show(): void;
    hide(): void;
  };
  
  // 设置按钮
  SettingsButton: {
    isVisible: boolean;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    show(): void;
    hide(): void;
  };
  
  // 触觉反馈
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
  
  // 云存储
  CloudStorage: {
    setItem(key: string, value: string, callback?: (error: string | null, stored: boolean) => void): void;
    getItem(key: string, callback: (error: string | null, value: string) => void): void;
    getItems(keys: string[], callback: (error: string | null, values: Record<string, string>) => void): void;
    removeItem(key: string, callback?: (error: string | null, removed: boolean) => void): void;
    removeItems(keys: string[], callback?: (error: string | null, removed: boolean) => void): void;
    getKeys(callback: (error: string | null, keys: string[]) => void): void;
  };
}

// 扩展 Window 接口
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

interface UseTelegramWebAppReturn {
  // WebApp 实例
  webApp: TelegramWebApp | null;
  
  // 用户信息
  user: TelegramUser | null;
  
  // 状态
  isReady: boolean;
  isInTelegram: boolean;
  platform: string;
  version: string;
  colorScheme: 'light' | 'dark';
  
  // 主题
  themeParams: TelegramWebApp['themeParams'];
  
  // 方法
  ready: () => void;
  expand: () => void;
  close: () => void;
  showAlert: (message: string) => Promise<void>;
  showConfirm: (message: string) => Promise<boolean>;
  showPopup: (params: Parameters<TelegramWebApp['showPopup']>[0]) => Promise<string>;
  
  // 触觉反馈
  hapticFeedback: {
    impact: (style?: 'light' | 'medium' | 'heavy') => void;
    notification: (type: 'error' | 'success' | 'warning') => void;
    selection: () => void;
  };
  
  // 主按钮控制
  mainButton: {
    show: (text: string, onClick: () => void) => void;
    hide: () => void;
    setLoading: (loading: boolean) => void;
    setText: (text: string) => void;
  };
  
  // 云存储
  cloudStorage: {
    setItem: (key: string, value: string) => Promise<boolean>;
    getItem: (key: string) => Promise<string | null>;
    removeItem: (key: string) => Promise<boolean>;
  };
}

export function useTelegramWebApp(): UseTelegramWebAppReturn {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 检查是否在 Telegram 环境中
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      setWebApp(tg);
      
      // 初始化 WebApp
      tg.ready();
      setIsReady(true);
      
      // 展开到全屏
      if (!tg.isExpanded) {
        tg.expand();
      }
      
      console.log('Telegram WebApp 初始化完成:', {
        version: tg.version,
        platform: tg.platform,
        user: tg.initDataUnsafe.user,
      });
    } else {
      console.warn('不在 Telegram WebApp 环境中');
    }
  }, []);

  // 用户信息
  const user = webApp?.initDataUnsafe.user || null;
  
  // 基础信息
  const isInTelegram = !!webApp;
  const platform = webApp?.platform || 'unknown';
  const version = webApp?.version || '0.0';
  const colorScheme = webApp?.colorScheme || 'light';
  const themeParams = webApp?.themeParams || {};

  // 方法封装
  const ready = () => webApp?.ready();
  const expand = () => webApp?.expand();
  const close = () => webApp?.close();

  const showAlert = (message: string): Promise<void> => {
    return new Promise((resolve) => {
      if (webApp) {
        webApp.showAlert(message, resolve);
      } else {
        alert(message);
        resolve();
      }
    });
  };

  const showConfirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (webApp) {
        webApp.showConfirm(message, resolve);
      } else {
        resolve(confirm(message));
      }
    });
  };

  const showPopup = (params: Parameters<TelegramWebApp['showPopup']>[0]): Promise<string> => {
    return new Promise((resolve) => {
      if (webApp) {
        webApp.showPopup(params, (buttonId) => resolve(buttonId || ''));
      } else {
        resolve(confirm(params.message) ? 'ok' : 'cancel');
      }
    });
  };

  // 触觉反馈
  const hapticFeedback = {
    impact: (style: 'light' | 'medium' | 'heavy' = 'medium') => {
      webApp?.HapticFeedback.impactOccurred(style);
    },
    notification: (type: 'error' | 'success' | 'warning') => {
      webApp?.HapticFeedback.notificationOccurred(type);
    },
    selection: () => {
      webApp?.HapticFeedback.selectionChanged();
    },
  };

  // 主按钮控制
  const mainButton = {
    show: (text: string, onClick: () => void) => {
      if (webApp) {
        webApp.MainButton.setText(text);
        webApp.MainButton.onClick(onClick);
        webApp.MainButton.show();
      }
    },
    hide: () => {
      webApp?.MainButton.hide();
    },
    setLoading: (loading: boolean) => {
      if (loading) {
        webApp?.MainButton.showProgress();
      } else {
        webApp?.MainButton.hideProgress();
      }
    },
    setText: (text: string) => {
      webApp?.MainButton.setText(text);
    },
  };

  // 云存储
  const cloudStorage = {
    setItem: (key: string, value: string): Promise<boolean> => {
      return new Promise((resolve) => {
        if (webApp) {
          webApp.CloudStorage.setItem(key, value, (error, stored) => {
            resolve(!error && stored);
          });
        } else {
          try {
            localStorage.setItem(`tg_${key}`, value);
            resolve(true);
          } catch {
            resolve(false);
          }
        }
      });
    },
    
    getItem: (key: string): Promise<string | null> => {
      return new Promise((resolve) => {
        if (webApp) {
          webApp.CloudStorage.getItem(key, (error, value) => {
            resolve(error ? null : value);
          });
        } else {
          resolve(localStorage.getItem(`tg_${key}`));
        }
      });
    },
    
    removeItem: (key: string): Promise<boolean> => {
      return new Promise((resolve) => {
        if (webApp) {
          webApp.CloudStorage.removeItem(key, (error, removed) => {
            resolve(!error && removed);
          });
        } else {
          try {
            localStorage.removeItem(`tg_${key}`);
            resolve(true);
          } catch {
            resolve(false);
          }
        }
      });
    },
  };

  return {
    webApp,
    user,
    isReady,
    isInTelegram,
    platform,
    version,
    colorScheme,
    themeParams,
    ready,
    expand,
    close,
    showAlert,
    showConfirm,
    showPopup,
    hapticFeedback,
    mainButton,
    cloudStorage,
  };
}

// 导出类型
export type { TelegramUser, TelegramWebApp, UseTelegramWebAppReturn };