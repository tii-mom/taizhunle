import { useMemo } from 'react';
import type { TFunction } from 'i18next';

type LocaleCard = {
  id: string;
  statusKey: string;
  title: string;
  description: string;
  odds: string;
  change: string;
  trend: 'up' | 'down';
  volume: string;
  liquidity: string;
};

type LocaleRecord = {
  user: string;
  amount: string;
  side: string;
  time: string;
};

type DetailData = {
  cardId: string;
  statusKey: string;
  title: string;
  description: string;
  odds: string;
  change: string;
  trend: 'up' | 'down';
  volume: string;
  liquidity: string;
  entries: LocaleRecord[];
};

export function useDetailData(id: string, t: TFunction<'detail'>): DetailData {
  return useMemo(() => {
    const cards = (t('cards', { returnObjects: true }) as LocaleCard[] | undefined) ?? [];
    const fallback = (t('fallback', { returnObjects: true }) as LocaleCard | undefined) ?? {
      id: 'fallback',
      statusKey: 'pending',
      title: t('title'),
      description: '',
      odds: '1.00x',
      change: '0.0%',
      trend: 'up',
      volume: '0 TAI',
      liquidity: '0 TAI',
    };
    const card = cards.find((entry) => entry.id === id) ?? cards[0] ?? fallback;
    const records = (t(`records.${card.id}`, { returnObjects: true }) as LocaleRecord[] | undefined) ?? [];
    return {
      cardId: card.id,
      statusKey: card.statusKey,
      title: card.title,
      description: card.description,
      odds: card.odds,
      change: card.change,
      trend: card.trend,
      volume: card.volume,
      liquidity: card.liquidity,
      entries: records,
    };
  }, [id, t]);
}
