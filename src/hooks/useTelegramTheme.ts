import { useEffect } from 'react';

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '14 165 233'; // Default accent color
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `${r} ${g} ${b}`;
}

export function useTelegramTheme() {
  useEffect(() => {
    const tgAccentColor = window.Telegram?.WebApp?.themeParams?.accent_color;

    if (tgAccentColor) {
      const rgbColor = hexToRgb(tgAccentColor);
      document.documentElement.style.setProperty('--color-accent', rgbColor);
    }
  }, []);
}
