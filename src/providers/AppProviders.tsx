import { useMemo, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TonConnectUIProvider, type Locales, THEME } from '@tonconnect/ui-react';
import { I18nextProvider } from 'react-i18next';

import i18n from '../i18n';
import { ThemeProvider, useTheme } from './ThemeProvider';

const queryClient = new QueryClient();

function TonConnectWrapper({ children }: { children: ReactNode }) {
  const { mode } = useTheme();
  
  const manifestUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return '';
    }
    return new URL('/tonconnect-manifest.json', window.location.origin).toString();
  }, []);

  return (
    <TonConnectUIProvider 
      manifestUrl={manifestUrl} 
      language={i18n.language as Locales} 
      uiPreferences={{ theme: mode === 'dark' ? THEME.DARK : THEME.LIGHT }}
    >
      {children}
    </TonConnectUIProvider>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <TonConnectWrapper>{children}</TonConnectWrapper>
        </ThemeProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}
