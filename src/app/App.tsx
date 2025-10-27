import { useState } from 'react';
import { TonConnectButton, useTonWallet } from '@tonconnect/ui-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useTonSignature } from '../hooks/useTonWallet';
import { useTheme } from '../providers/ThemeProvider';
import { useHaptic } from '../hooks/useHaptic';
import { useTelegramTheme } from '../hooks/useTelegramTheme';
import { FilterToggle } from '../components/market/FilterToggle';
import { TotalPool } from '../components/market/TotalPool';
import { WhaleFeed } from '../components/market/WhaleFeed';
import { ExpandedPrediction } from '../components/market/ExpandedPrediction';
import { EmptyState } from '../components/common/EmptyState';
import { Logo } from '../components/common/Logo';
import { PageLayout } from '../components/layout/PageLayout';
import { useMarketsQuery, type MarketFilter } from '../services/markets';
import confetti from 'canvas-confetti';

export function App() {
  const { t, i18n } = useTranslation();
  const { mode, toggle } = useTheme();
  const wallet = useTonWallet();
  useTelegramTheme();
  const { requestSignature, isReady } = useTonSignature();
  const { vibrate } = useHaptic();
  const [activeFilter, setActiveFilter] = useState<MarketFilter>('all');
  const marketsQuery = useMarketsQuery(activeFilter);
  const allMarketsQuery = useMarketsQuery('all');

  const cards = marketsQuery.data ?? [];

  const handleLanguageSwitch = () => void i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en');

  const handlePlaceBet = async (side: 'yes' | 'no', amount: number) => {
    if (!isReady) {
      window.alert(t('market.betUnavailable'));
      return;
    }
    try {
      vibrate(10);
      await requestSignature(t('market.betSignature', { market: `${side}-${amount}` }));
      
      // Success confetti
      void confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      
      window.alert(t('market.betQueued'));
    } catch (error) {
      console.error(error);
      window.alert(t('market.betFailed'));
    }
  };



  return (
    <PageLayout>
      <header className="flex flex-col gap-4 rounded-xl border border-light bg-surface-glass p-6 shadow-2xl backdrop-blur-lg md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Logo size="lg" />
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{t('market.badge')}</p>
              <h1 className="text-3xl font-semibold">{t('market.heroTitle')}</h1>
              <p className="text-text-secondary">{t('market.heroSubtitle')}</p>
              <p className="text-sm text-text-secondary">
                {wallet ? t('market.walletConnected', { address: wallet.account.address }) : t('market.walletEmpty')}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <TonConnectButton />
            <button
              type="button"
              onClick={() => {
                vibrate();
                toggle();
              }}
              className="rounded-full border border-border bg-background px-4 py-2 text-sm transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95 md:hover:shadow-lg"
            >
              {mode === 'light' ? t('app.theme.dark') : t('app.theme.light')}
            </button>
            <button
              type="button"
              onClick={() => {
                vibrate();
                handleLanguageSwitch();
              }}
              className="rounded-full border border-border bg-background px-4 py-2 text-sm transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95 md:hover:shadow-lg"
            >
              {t('actions.toggleLanguage')}
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/create"
              className="rounded-full border border-border bg-background px-4 py-2 text-sm text-text-secondary transition-all duration-200 hover:text-text-primary hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 md:hover:shadow-lg"
            >
              {t('market.cta.create')}
            </Link>
            <Link
              to="/red-packet"
              className="rounded-full border border-border bg-background px-4 py-2 text-sm text-text-secondary transition-all duration-200 hover:text-text-primary hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 md:hover:shadow-lg"
            >
              {t('market.cta.packets')}
            </Link>
            <Link
              to="/profile"
              className="rounded-full border border-border bg-background px-4 py-2 text-sm text-text-secondary transition-all duration-200 hover:text-text-primary hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 md:hover:shadow-lg"
            >
              {t('market.cta.profile')}
            </Link>
            <Link
              to="/invite"
              className="rounded-full border border-border bg-background px-4 py-2 text-sm text-text-secondary transition-all duration-200 hover:text-text-primary hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 md:hover:shadow-lg"
            >
              {t('market.cta.invite')}
            </Link>
            <Link
              to="/avatars"
              className="rounded-full border border-border bg-background px-4 py-2 text-sm text-text-secondary transition-all duration-200 hover:text-text-primary hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 md:hover:shadow-lg"
            >
              {t('market.cta.avatars')}
            </Link>
            <Link
              to="/ranking"
              className="rounded-full border border-border bg-background px-4 py-2 text-sm text-text-secondary transition-all duration-200 hover:text-text-primary hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 md:hover:shadow-lg"
            >
              {t('market.cta.ranking')}
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-[2fr,1fr]">
          {allMarketsQuery.isLoading ? (
            <article className="animate-pulse space-y-4 rounded-xl border border-light bg-surface-glass p-6 shadow-2xl backdrop-blur-lg">
              <div className="h-3 w-24 rounded bg-border" />
              <div className="h-10 w-1/2 rounded bg-border" />
              <div className="h-3 w-32 rounded bg-border" />
              <div className="h-10 w-40 rounded-full bg-border" />
            </article>
          ) : allMarketsQuery.isError ? (
            <article className="rounded-xl border border-light bg-surface-glass p-6 text-text-secondary backdrop-blur-lg shadow-2xl">
              {t('common.loadError')}
            </article>
          ) : (
            <TotalPool markets={allMarketsQuery.data ?? []} onWatch={() => setActiveFilter('live')} />
          )}
        </section>

        <WhaleFeed />



        <section className="space-y-6 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-text-primary">{t('market.title')}</h2>
            <FilterToggle value={activeFilter} onChange={setActiveFilter} />
          </div>
          {marketsQuery.isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <article key={index} className="animate-pulse space-y-4 rounded-xl border border-light bg-surface-glass p-6 shadow-2xl backdrop-blur-lg">
                  <div className="h-4 w-1/3 rounded bg-border" />
                  <div className="h-6 w-2/3 rounded bg-border" />
                  <div className="h-4 w-full rounded bg-border" />
                  <div className="h-24 w-full rounded-2xl bg-border" />
                  <div className="flex gap-3">
                    <div className="h-10 w-24 rounded-full bg-border" />
                    <div className="h-10 w-24 rounded-full bg-border" />
                  </div>
                </article>
              ))}
            </div>
          ) : marketsQuery.isError ? (
            <p className="rounded-xl border border-light bg-surface-glass p-6 text-text-secondary backdrop-blur-lg shadow-2xl">{t('common.loadError')}</p>
          ) : cards.length === 0 ? (
            <EmptyState type="market" />
          ) : (
            <div className="space-y-6">
              {cards.map((card) => (
                <ExpandedPrediction
                  key={card.id}
                  card={card}
                  onPlaceBet={handlePlaceBet}
                />
              ))}
            </div>
          )}
        </section>
    </PageLayout>
  );
}
