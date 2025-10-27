import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DetailSummary } from '../components/detail/Summary';
import { DetailHistory } from '../components/detail/History';
import { BetModal } from '../components/BetModal';
import { useDetailData } from '../components/detail/useDetailData';
import { PageLayout } from '../components/layout/PageLayout';

export function Detail() {
  const { id = '' } = useParams();
  const { t } = useTranslation('detail');
  const [open, setOpen] = useState(false);
  const data = useDetailData(id, t);
  const history = useMemo(
    () =>
      data.entries.map((entry, index) => ({
        key: `${data.cardId}-${index}`,
        user: entry.user,
        amount: entry.amount,
        side: entry.side,
        time: entry.time,
      })),
    [data.cardId, data.entries],
  );

  return (
    <PageLayout>
      <div className="space-y-6">
      <DetailSummary
        statusKey={data.statusKey}
        trend={data.trend}
        title={data.title}
        description={data.description}
        odds={data.odds}
        change={data.change}
        volume={data.volume}
        liquidity={data.liquidity}
        onBet={() => setOpen(true)}
        onShare={() => window.alert(t('sharePrompt'))}
      />
      <DetailHistory items={history} empty={t('historyEmpty')} />
      <BetModal
        open={open}
        title={t('modal.title')}
        confirmLabel={t('modal.confirm')}
        cancelLabel={t('modal.cancel')}
        amountLabel={t('modal.amount')}
        amountError={t('modal.amountError')}
        noteLabel={t('modal.note')}
        noteError={t('modal.noteError')}
        onClose={() => setOpen(false)}
        onSubmit={async () => window.alert(t('modal.success'))}
      />
      </div>
    </PageLayout>
  );
}
