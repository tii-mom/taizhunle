import React from 'react';
import ReactDOM from 'react-dom/client';
import { TonConnectUIProvider, THEME } from '@tonconnect/ui-react';

import { TelegramMiniApp } from './mini-app/TelegramMiniApp';
import './index.css';
import './styles/glass.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const manifestUrl = new URL('/tonconnect-manifest.json', window.location.origin).toString() as `${string}://${string}`;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      actionsConfiguration={{ twaReturnUrl: window.location.href as `${string}://${string}` }}
      uiPreferences={{ theme: THEME.DARK }}
    >
      <TelegramMiniApp />
    </TonConnectUIProvider>
  </React.StrictMode>,
);
