import { useState } from 'react';
import { TonConnectButton, useTonWallet } from '@tonconnect/ui-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useTonSignature } from '../hooks/useTonWallet';
import { useTheme } from '../providers/ThemeProvider';
import emptyMarketIllustration from '../assets/empty-market.svg';
import { FilterToggle } from '../components/market/FilterToggle';
import { TotalPool } from '../components/market/TotalPool';
import { WhaleFeed } from '../components/market/WhaleFeed';
import { useMarketsQuery, type MarketCard, type MarketFilter } from '../services/markets';

export function App() {
  const { t, i18n } = useTranslation();
  const { mode, toggle } = useTheme();
  const wallet = useTonWallet();
  const { requestSignature, isReady } = useTonSignature();
  const [activeFilter, setActiveFilter] = useState<MarketFilter>('all');
  const marketsQuery = useMarketsQuery(activeFilter);
  const allMarketsQuery = useMarketsQuery('all');

  const cards = marketsQuery.data ?? [];

  const handleLanguageSwitch = () => void i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en');

  const handlePlaceBet = async (card: MarketCard) => {
    if (!isReady) {
      window.alert(t('market.bet.unavailable'));
      return;
    }
    try {
      await requestSignature(t('market.bet.signature', { market: card.id }));
      window.alert(t('market.bet.queued'));
    } catch (error) {
      console.error(error);
      window.alert(t('market.bet.failed'));
    }
  };

  const handleShare = async (card: MarketCard) => {
    const sharePayload = t('market.share.text', {
      title: card.title,
      odds: card.odds,
      volume: card.volume,
    });
    try {
      if (navigator.share) {
        await navigator.share({ title: t('market.share.title'), text: sharePayload });
        window.alert(t('market.share.copied'));
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(sharePayload);
        window.alert(t('market.share.copied'));
        return;
      }
      window.alert(t('market.share.failed'));
    } catch (error) {
      console.error(error);
      window.alert(t('market.share.failed'));
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6 shadow-surface md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{t('market.badge')}</p>
            <h1 className="text-3xl font-semibold">{t('market.heroTitle')}</h1>
            <p className="text-text-secondary">{t('market.heroSubtitle')}</p>
            <p className="text-sm text-text-secondary">
              {wallet ? t('market.walletConnected', { address: wallet.account.address }) : t('market.walletEmpty')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <TonConnectButton />
            <button type="button" onClick={toggle} className="rounded-full border border-border bg-background px-4 py-2 text-sm">
              {mode === 'light' ? t('app.theme.dark') : t('app.theme.light')}
            </button>
            <button type="button" onClick={handleLanguageSwitch} className="rounded-full border border-border bg-background px-4 py-2 text-sm">
              {t('actions.toggleLanguage')}
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/create"
              className="rounded-full border border-border bg-background px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
            >
              {t('market.cta.create')}
            </Link>
            <Link
              to="/red-packet"
              className="rounded-full border border-border bg-background px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
            >
              {t('market.cta.packets')}
            </Link>
            <Link
              to="/profile"
              className="rounded-full border border-border bg-background px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
            >
              {t('market.cta.profile')}
            </Link>
            <Link
              to="/invite"
              className="rounded-full border border-border bg-background px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
            >
              {t('market.cta.invite')}
            </Link>
            <Link
              to="/avatars"
              className="rounded-full border border-border bg-background px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
            >
              {t('market.cta.avatars')}
            </Link>
            <Link
              to="/ranking"
              className="rounded-full border border-border bg-background px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
            >
              {t('market.cta.ranking')}
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-[2fr,1fr]">
          {allMarketsQuery.isLoading ? (
            <article className="animate-pulse space-y-4 rounded-3xl border border-border bg-surface p-6 shadow-surface">
              <div className="h-3 w-24 rounded bg-border" />
              <div className="h-10 w-1/2 rounded bg-border" />
              <div className="h-3 w-32 rounded bg-border" />
              <div className="h-10 w-40 rounded-full bg-border" />
            </article>
          ) : allMarketsQuery.isError ? (
            <article className="rounded-3xl border border-border bg-surface p-6 text-text-secondary">
              {t('common.loadError')}
            </article>
          ) : (
            <TotalPool markets={allMarketsQuery.data ?? []} onWatch={() => setActiveFilter('live')} />
          )}
        </section>

        <WhaleFeed />

        <section className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-surface p-6 shadow-surface">
          <div>
            <h2 className="text-xl font-semibold">{t('market.filterTitle')}</h2>
            <p className="text-sm text-text-secondary">{t('market.filterDescription')}</p>
          </div>
          <FilterToggle value={activeFilter} onChange={setActiveFilter} />
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          {marketsQuery.isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <article key={index} className="animate-pulse space-y-4 rounded-3xl border border-border bg-surface p-6 shadow-surface">
                <div className="h-4 w-1/3 rounded bg-border" />
                <div className="h-6 w-2/3 rounded bg-border" />
                <div className="h-4 w-full rounded bg-border" />
                <div className="h-24 w-full rounded-2xl bg-border" />
                <div className="flex gap-3">
                  <div className="h-10 w-24 rounded-full bg-border" />
                  <div className="h-10 w-24 rounded-full bg-border" />
                </div>
              </article>
            ))
          ) : marketsQuery.isError ? (
            <p className="rounded-3xl border border-border bg-surface p-6 text-text-secondary">{t('common.loadError')}</p>
          ) : cards.length === 0 ? (
            <article className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-surface p-10 text-center text-text-secondary">
              <img src={emptyMarketIllustration} alt={t('market.empty')} className="h-32 w-auto" />
              <p>{t('market.empty')}</p>
            </article>
          ) : (
            cards.map((card) => (
              <article key={card.id} className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6 shadow-surface">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{card.status}</p>
                    <Link
                      to={`/detail/${card.id}`}
                      className="mt-1 block text-xl font-semibold text-text-primary hover:text-accent"
                    >
                      {card.title}
                    </Link>
                    <p className="mt-1 text-sm text-text-secondary">{card.description}</p>
                  </div>
                  <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-text-secondary">
                    {card.filter === 'closed' ? t('market.badges.settled') : t('market.badges.live')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-6 rounded-2xl border border-border/70 bg-background/50 px-4 py-3 text-sm text-text-secondary">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-text-secondary/80">{t('market.card.oddsLabel')}</p>
                    <p className="text-lg font-semibold text-text-primary">{card.odds}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-text-secondary/80">{t('market.card.volumeLabel')}</p>
                    <p className="text-lg font-semibold text-text-primary">{card.volume}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="button" className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-contrast">
                    {t('market.cta.enter')}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handlePlaceBet(card)}
                    disabled={!isReady}
                    className="rounded-full border border-border px-6 py-3 text-sm text-text-primary transition-opacity disabled:opacity-50"
                  >
                    {t('market.cta.place')}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleShare(card)}
                    className="rounded-full border border-border px-6 py-3 text-sm text-text-secondary"
                  >
                    {t('market.cta.share')}
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
