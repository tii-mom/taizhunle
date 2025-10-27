import { useMemo, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TonConnectUIProvider, type Locales } from '@tonconnect/ui-react';
import { I18nextProvider } from 'react-i18next';

import i18n from '../i18n';
import { ThemeProvider } from './ThemeProvider';

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: ReactNode }) {
  const manifestUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return '';
    }

    return new URL('/tonconnect-manifest.json', window.location.origin).toString();
  }, []);

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl} language={i18n.language as Locales} uiPreferences={{ theme: 'SYSTEM' }}>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider>{children}</ThemeProvider>
        </I18nextProvider>
      </QueryClientProvider>
    </TonConnectUIProvider>
  );
}
