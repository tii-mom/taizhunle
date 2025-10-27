import React from 'react';
import ReactDOM from 'react-dom/client';

import { RouterProvider } from 'react-router-dom';

import { router } from './router';
import { AppProviders } from './providers/AppProviders';
import { SplashScreen } from './components/common/SplashScreen';
import './index.css';
import './i18n';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <SplashScreen />
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </React.StrictMode>,
);
