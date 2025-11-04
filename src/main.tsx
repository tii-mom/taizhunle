import React from 'react';
import ReactDOM from 'react-dom/client';

import { RouterProvider } from 'react-router-dom';

import { router } from './router';
import { AppProviders } from './providers/AppProviders';
import { SplashScreen } from './components/common/SplashScreen';
import './index.css';
import './styles/glass.css';
import './i18n';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

console.log('🚀 Starting React app...');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <SplashScreen />
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </React.StrictMode>,
);

console.log('✅ React app rendered');
