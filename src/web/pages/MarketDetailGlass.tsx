import clsx from 'clsx';
import { useMemo } from 'react';
import { useTonWallet } from '@tonconnect/ui-react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { GlassPageLayout } from '@/components/glass/GlassPageLayout';
import { SystemInfoGlass } from '@/components/glass/SystemInfoGlass';
import { BetModalGlass } from '@/components/glass/BetModalGlass';
import { AuroraPanel } from '@/components/glass/AuroraPanel';
import { marketDetailQuery } from '@/queries/marketDetail';
import { useI18n } from '@/hooks/useI18n';
import { useTheme } from '@/providers/ThemeProvider';
import { formatTAI } from '@/utils/format';
import { MarketNewsDrawer } from '@/components/market/MarketNewsDrawer';
import { LazyOddsChart } from '@/components/market-detail/LazyOddsChart';
import { LazyComments } from '@/components/market-detail/LazyComments';

function shorten(address: string): string {
  if (!address) return '';
  return address.length <= 12 ? address : `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function formatRelativeTime(value: number, locale: string): string {
  const diffSeconds = Math.round((value - Date.now()) / 1000);
  const absSeconds = Math.abs(diffSeconds);
  const formatter = new Intl.RelativeTimeFormat(locale === 'zh' ? 'zh-CN' : 'en', {
    numeric: 'auto',
  });

  if (absSeconds < 60) {
    return formatter.format(diffSeconds, 'second');
  }
  if (absSeconds < 3600) {
    return formatter.format(Math.round(diffSeconds / 60), 'minute');
  }
  if (absSeconds < 86400) {
    return formatter.format(Math.round(diffSeconds / 3600), 'hour');
  }
  return formatter.format(Math.round(diffSeconds / 86400), 'day');
}

export function MarketDetailGlass() {
  const { id = '' } = useParams();
  const { data, isPending } = useQuery({
    ...marketDetailQuery(id),
    enabled: Boolean(id),
  });
  const wallet = useTonWallet();
  const { t, locale } = useI18n(['home', 'detail', 'market']);
  const { mode } = useTheme();
  const isLight = mode === 'light';
  const messageClass = mode === 'light' ? 'text-slate-700' : 'text-white/70';

  const walletAddress = wallet?.account?.address ?? null;
  const normalizedWallet = walletAddress?.toLowerCase() ?? null;

  const sortedBets = useMemo(() => {
    const list = data?.bets ?? [];
    return [...list].sort((a, b) => b.timestamp - a.timestamp);
  }, [data?.bets]);

  const myBets = useMemo(() => {
    if (!normalizedWallet) {
      return [];
    }
    return sortedBets.filter((bet) => bet.walletAddress?.toLowerCase() === normalizedWallet);
  }, [normalizedWallet, sortedBets]);

  const latestMyBet = myBets[0];
  const recentBets = sortedBets.slice(0, 6);

  if (!id) {
    return (
      <GlassPageLayout>
        <div className={`glass-card p-6 text-center text-sm ${messageClass}`}>{t('home:errors.missingMarket')}</div>
      </GlassPageLayout>
    );
  }

  if (isPending || !data) {
    return (
      <GlassPageLayout>
        <div className="space-y-6 pb-12">
          <div className="glass-card h-48 animate-pulse border-white/10 bg-white/5" />
          <div className="glass-card h-80 animate-pulse border-white/10 bg-white/5" />
        </div>
      </GlassPageLayout>
    );
  }

  return (
    <GlassPageLayout>
      <div className="space-y-6 pb-12">
        <SystemInfoGlass data={data.systemInfo} />

        {data.systemInfo.referenceUrl ? (
          <AuroraPanel
            variant="emerald"
            className={clsx(
              'flex flex-col gap-3 p-5',
              isLight ? 'text-slate-700' : 'text-white/80',
            )}
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <p className={clsx('text-xs uppercase tracking-[0.3em]', isLight ? 'text-slate-500' : 'text-white/50')}>
                  {t('detail:reference.title')}
                </p>
                <h4 className={clsx('mt-1 text-lg font-semibold', isLight ? 'text-slate-900' : 'text-white')}>
                  {t('detail:reference.subtitle')}
                </h4>
              </div>
              <a
                href={data.systemInfo.referenceUrl}
                target="_blank"
                rel="noreferrer"
                className={clsx(
                  'inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-medium transition',
                  isLight
                    ? 'border border-violet-200 bg-white/90 text-violet-600 shadow-[0_12px_24px_-22px_rgba(139,92,246,0.35)] hover:text-violet-700'
                    : 'border border-white/15 bg-white/10 text-white/80 hover:text-white',
                )}
              >
                {t('detail:reference.viewSource')}
              </a>
            </div>
            {data.systemInfo.referenceSummary ? (
              <p className={clsx('text-sm leading-relaxed', isLight ? 'text-slate-600' : 'text-white/70')}>
                {data.systemInfo.referenceSummary}
              </p>
            ) : (
              <p className={clsx('text-sm italic', isLight ? 'text-slate-400' : 'text-white/50')}>
                {t('detail:reference.emptySummary')}
              </p>
            )}

            {data.systemInfo.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                <span className={clsx('uppercase tracking-[0.25em]', isLight ? 'text-slate-400' : 'text-white/40')}>
                  {t('detail:reference.tags')}
                </span>
                {data.systemInfo.tags.map((tag) => (
                  <span
                    key={tag}
                    className={clsx(
                      'rounded-full border px-3 py-1 font-medium',
                      isLight
                        ? 'border-violet-200 bg-white text-violet-600'
                        : 'border-white/15 bg-white/10 text-white/80',
                    )}
                  >
                    #{t(`detail:tagCopy.${tag}`, { defaultValue: tag })}
                  </span>
                ))}
              </div>
            ) : null}
          </AuroraPanel>
        ) : null}

        <MarketNewsDrawer marketId={id} tags={data.systemInfo.tags} />
        <BetModalGlass
          data={data.betModal}
          odds={{ yes: data.systemInfo.yesOdds, no: data.systemInfo.noOdds }}
        />

        <LazyOddsChart marketId={id} />

        <AuroraPanel
          variant="emerald"
          className={clsx('flex flex-col gap-4', isLight ? 'text-slate-800' : 'text-white/80')}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className={clsx('text-lg font-semibold', isLight ? 'text-slate-900' : 'text-white')}>
                {t('detail:myPosition.title')}
              </h3>
              <p className={clsx('text-sm', isLight ? 'text-slate-600' : 'text-white/60')}>
                {t('detail:myPosition.subtitle')}
              </p>
            </div>
            {walletAddress ? (
              <span
                className={clsx(
                  'rounded-full border px-3 py-1 text-xs font-medium',
                  isLight
                    ? 'border-slate-200 bg-white/90 text-slate-600 shadow-[0_12px_26px_-24px_rgba(148,163,184,0.45)]'
                    : 'border-white/15 bg-white/10 text-white/80',
                )}
              >
                {t('detail:myPosition.wallet', { address: shorten(walletAddress) })}
              </span>
            ) : null}
          </div>

          {!walletAddress ? (
            <p
              className={clsx(
                'mt-4 rounded-2xl border px-4 py-3 text-sm shadow-inner',
                isLight
                  ? 'border-amber-200/60 bg-amber-100/70 text-amber-700'
                  : 'border-amber-400/30 bg-amber-500/15 text-amber-100',
              )}
            >
              {t('detail:myPosition.connectHint')}
            </p>
          ) : null}

          {walletAddress && !latestMyBet ? (
            <p
              className={clsx(
                'mt-4 rounded-2xl border px-4 py-3 text-sm',
                isLight ? 'border-slate-200 bg-white/90 text-slate-500' : 'border-white/20 bg-white/10 text-white/70',
              )}
            >
              {t('detail:myPosition.empty')}
            </p>
          ) : null}

          {myBets.length > 0 ? (
            <div className="mt-4 space-y-3">
              {myBets.map((bet) => (
                <div
                  key={bet.id}
                  className={clsx(
                    'grid gap-4 rounded-2xl border p-4 text-sm shadow-inner md:grid-cols-5 transition-colors',
                    isLight
                      ? 'border-slate-200 bg-white/95 text-slate-700'
                      : 'border-white/12 bg-white/6 text-white/80',
                  )}
                >
                  <div>
                    <p className={clsx('text-xs uppercase tracking-[0.2em]', isLight ? 'text-slate-500' : 'text-white/50')}>
                      {t('detail:myPosition.side')}
                    </p>
                    <p className={clsx('mt-1 font-semibold', isLight ? 'text-slate-900' : 'text-white')}>
                      {bet.side === 'yes' ? t('market:yes') : t('market:no')}
                    </p>
                  </div>
                  <div>
                    <p className={clsx('text-xs uppercase tracking-[0.2em]', isLight ? 'text-slate-500' : 'text-white/50')}>
                      {t('detail:myPosition.amount')}
                    </p>
                    <p className={clsx('mt-1 font-mono text-lg', isLight ? 'text-slate-900' : 'text-white')}>
                      {formatTAI(bet.amount)} TAI
                    </p>
                  </div>
                  <div>
                    <p className={clsx('text-xs uppercase tracking-[0.2em]', isLight ? 'text-slate-500' : 'text-white/50')}>
                      {t('detail:myPosition.payout')}
                    </p>
                    <p className={clsx('mt-1 font-mono text-lg', isLight ? 'text-slate-900' : 'text-white')}>
                      {formatTAI(bet.potentialPayout)} TAI
                    </p>
                  </div>
                  <div>
                    <p className={clsx('text-xs uppercase tracking-[0.2em]', isLight ? 'text-slate-500' : 'text-white/50')}>
                      {t('detail:myPosition.profit')}
                    </p>
                    <p className={clsx('mt-1 font-mono text-lg', isLight ? 'text-emerald-600' : 'text-emerald-200')}>
                      {formatTAI(Math.max(bet.potentialPayout - bet.amount, 0))} TAI
                    </p>
                  </div>
                  <div className={clsx('flex flex-col justify-between text-xs', isLight ? 'text-slate-400' : 'text-white/60')}>
                    <span>{formatRelativeTime(bet.timestamp, locale)}</span>
                    <span className={clsx('font-mono', isLight ? 'text-slate-500' : 'text-white/70')}>
                      #{bet.id.slice(-6)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {myBets.length > 0 ? (
            <div className={clsx('mt-3 text-xs', isLight ? 'text-slate-500' : 'text-white/50')}>
              {t('detail:myPosition.count', { count: myBets.length })}
            </div>
          ) : null}
        </AuroraPanel>

        <AuroraPanel variant="neutral" className={clsx('flex flex-col gap-4', isLight ? 'text-slate-700' : 'text-white/80')}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={clsx('text-lg font-semibold', isLight ? 'text-slate-900' : 'text-white')}>
                {t('detail:activity.title')}
              </h3>
              <p className={clsx('text-xs uppercase tracking-[0.3em]', isLight ? 'text-slate-400' : 'text-white/40')}>
                {t('detail:activity.subtitle', { count: recentBets.length })}
              </p>
            </div>
            <span
              className={clsx(
                'flex h-2 w-2 items-center justify-center rounded-full',
                isLight
                  ? 'bg-emerald-400 shadow-[0_0_12px_rgba(34,197,94,0.45)]'
                  : 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]',
              )}
            />
          </div>

          {recentBets.length === 0 ? (
            <p
              className={clsx(
                'mt-4 rounded-2xl border px-4 py-3 text-sm',
                isLight ? 'border-slate-200 bg-white/90 text-slate-500' : 'border-white/10 bg-white/5 text-white/70',
              )}
            >
              {t('detail:activity.empty')}
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {recentBets.map((bet) => {
                const isMine = normalizedWallet && bet.walletAddress?.toLowerCase() === normalizedWallet;
                return (
                  <div
                    key={bet.id}
                    className={clsx(
                      'flex flex-col gap-3 rounded-2xl border px-4 py-3 text-sm shadow-[0_18px_34px_-32px_rgba(15,23,42,0.4)] transition sm:flex-row sm:items-center sm:justify-between',
                      isLight
                        ? 'border-slate-200 bg-white/95 text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/60'
                        : 'border-white/10 bg-white/6 text-white/80 hover:border-emerald-400/40 hover:bg-emerald-500/10',
                      isMine && (isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'),
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{bet.user}</span>
                      <span
                        className={clsx(
                          'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
                          bet.side === 'yes'
                            ? isLight
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-emerald-500/20 text-emerald-100'
                            : isLight
                              ? 'bg-rose-100 text-rose-600'
                              : 'bg-rose-500/20 text-rose-100',
                        )}
                      >
                        {bet.side === 'yes' ? '↗' : '↘'} {bet.side === 'yes' ? t('market:yes') : t('market:no')}
                      </span>
                    </div>
                    <div
                      className={clsx(
                        'flex flex-1 flex-wrap items-center justify-start gap-4 text-xs uppercase tracking-[0.2em] sm:justify-end',
                        isLight ? 'text-slate-400' : 'text-white/50',
                      )}
                    >
                      <span className={clsx(isLight ? 'text-slate-600' : 'text-white/80')}>
                        {t('detail:historyColumns.amount')}
                        <span className={clsx('ml-2 font-mono text-base', isLight ? 'text-slate-900' : 'text-white/90')}>
                          {formatTAI(bet.amount)} TAI
                        </span>
                      </span>
                      <span className={clsx(isLight ? 'text-slate-500' : 'text-white/70')}>
                        {t('detail:historyColumns.payout')}
                        <span className={clsx('ml-2 font-mono text-base', isLight ? 'text-slate-900' : 'text-white/90')}>
                          {formatTAI(bet.potentialPayout)} TAI
                        </span>
                      </span>
                      <span className={clsx(isLight ? 'text-slate-400' : 'text-white/60')}>
                        {formatRelativeTime(bet.timestamp, locale)}
                      </span>
                    </div>
                  </div>
              );
            })}
          </div>
        )}
        </AuroraPanel>

        <LazyComments marketId={id} />
      </div>
    </GlassPageLayout>
  );
}
