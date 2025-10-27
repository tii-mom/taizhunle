import { useState } from 'react';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';

import { useTonSignature } from '../hooks/useTonWallet';
import { useTheme } from '../providers/ThemeProvider';
import { useHaptic } from '../hooks/useHaptic';
import { useTelegramTheme } from '../hooks/useTelegramTheme';
import { useUserBalance } from '../hooks/useUserBalance';
import { FilterToggle } from '../components/market/FilterToggle';
import { ExpandedPrediction } from '../components/market/ExpandedPrediction';
import { EmptyState } from '../components/common/EmptyState';
import { Logo } from '../components/common/Logo';
import { TaiBalance } from '../components/layout/TaiBalance';
import { PageLayout } from '../components/layout/PageLayout';
import { useMarketsQuery, type MarketFilter } from '../services/markets';

export function App() {
  const { t, i18n } = useTranslation();
  const { mode, toggle } = useTheme();
  useTelegramTheme();
  const { requestSignature, isReady } = useTonSignature();
  const { vibrate } = useHaptic();
  const [activeFilter, setActiveFilter] = useState<MarketFilter>('all');
  const marketsQuery = useMarketsQuery(activeFilter);
  const { data: userBalance } = useUserBalance();

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
      {/* Top Bar: Logo + Balance + Wallet + Theme + Language */}
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border-light bg-surface-glass/60 p-4 backdrop-blur-md">
        <Logo size="md" />
        
        {/* TAI Balance + Today Profit */}
        {userBalance && (
          <TaiBalance balance={userBalance.balance} todayProfit={userBalance.todayProfit} />
        )}
        
        <div className="flex flex-wrap items-center gap-3">
          <TonConnectButton />
          <button
            type="button"
            onClick={() => {
              vibrate();
              toggle();
            }}
            className="rounded-full border border-border bg-background px-4 py-2 text-sm transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95"
          >
            {mode === 'light' ? '🌙' : '☀️'}
          </button>
          <button
            type="button"
            onClick={() => {
              vibrate();
              handleLanguageSwitch();
            }}
            className="rounded-full border border-border bg-background px-4 py-2 text-sm transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95"
          >
            {i18n.language === 'zh' ? 'EN' : '中文'}
          </button>
        </div>
      </header>

      {/* Expanded Predictions */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-extrabold tracking-tight text-text-primary drop-shadow-[0_0_10px_rgba(var(--accent),0.5)]">
            {t('market.title')}
          </h2>
          <FilterToggle value={activeFilter} onChange={setActiveFilter} />
        </div>

        {marketsQuery.isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <article
                key={index}
                className="animate-pulse space-y-4 rounded-2xl border border-border-light bg-surface-glass/60 p-6 backdrop-blur-md"
              >
                <div className="h-6 w-2/3 rounded bg-border" />
                <div className="h-4 w-full rounded bg-border" />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="h-32 rounded-xl bg-border" />
                  <div className="h-32 rounded-xl bg-border" />
                </div>
              </article>
            ))}
          </div>
        ) : marketsQuery.isError ? (
          <article className="rounded-2xl border border-border-light bg-surface-glass/60 p-6 text-text-secondary backdrop-blur-md">
            {t('common.loadError')}
          </article>
        ) : cards.length === 0 ? (
          <EmptyState type="market" />
        ) : (
          <div className="space-y-6">
            {cards.map((card) => (
              <ExpandedPrediction key={card.id} card={card} onPlaceBet={handlePlaceBet} />
            ))}
          </div>
        )}
      </section>
    </PageLayout>
  );
}
