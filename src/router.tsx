import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
import { lazy, Suspense, type ReactElement } from 'react';
import { useTonWallet } from '@tonconnect/ui-react';

import { PageSkeleton } from './components/common/PageSkeleton';
import { PageTransition } from './components/common/PageTransition';
import { Assets } from './pages/Assets';
import { RedPacketSale } from './pages/RedPacketSale';
import { OfficialRain } from './pages/OfficialRain';
import { Invite } from './pages/Invite';
import { Ranking } from './pages/Ranking';

const AppPage = lazy(() => import('./app/App').then((module) => ({ default: module.App })));
const DetailPage = lazy(() => import('./pages/Detail').then((module) => ({ default: module.Detail })));
const CreatePage = lazy(() => import('./pages/Create').then((module) => ({ default: module.Create })));
const ProfilePage = lazy(() => import('./pages/Profile').then((module) => ({ default: module.Profile })));
const LoginPage = lazy(() => import('./pages/Login').then((module) => ({ default: module.Login })));
const DaoPage = lazy(() => import('./pages/DaoGlass').then((module) => ({ default: module.DaoGlass })));
const SearchPage = lazy(() => import('./pages/SearchGlass').then((module) => ({ default: module.SearchGlass })));

const withWalletGuard = (element: ReactElement) => {
  const WalletGuard = () => {
    const wallet = useTonWallet();
    if (!wallet) {
      return <Navigate to="/login" replace />;
    }
    return element;
  };

  WalletGuard.displayName = 'WalletGuard';
  return <WalletGuard />;
};

const TransitionLayout = () => {
  const location = useLocation();

  return (
    <PageTransition routeKey={`${location.pathname}${location.search}`}>
      <Suspense fallback={<PageSkeleton />}>
        <Outlet />
      </Suspense>
    </PageTransition>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <TransitionLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { index: true, element: withWalletGuard(<AppPage />) },
      { path: 'detail/:id', element: withWalletGuard(<DetailPage />) },
      { path: 'market/:id', element: withWalletGuard(<DetailPage />) },
      { path: 'create', element: withWalletGuard(<CreatePage />) },
      { path: 'search', element: withWalletGuard(<SearchPage />) },
      { path: 'dao', element: withWalletGuard(<DaoPage />) },
      { path: 'assets', element: withWalletGuard(<Assets />) },
      { path: 'assets/redpacket', element: withWalletGuard(<RedPacketSale />) },
      { path: 'assets/official', element: withWalletGuard(<OfficialRain />) },
      { path: 'profile', element: withWalletGuard(<ProfilePage />) },
      { path: 'invite', element: withWalletGuard(<Invite />) },
      { path: 'ranking', element: withWalletGuard(<Ranking />) },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
