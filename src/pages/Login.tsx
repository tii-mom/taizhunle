import { useEffect } from 'react';
import { TonConnectButton, useTonWallet } from '@tonconnect/ui-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useTonSign } from '../hooks/useTonSign';
import { WalletIllustration } from '../lib/icons';

export function Login() {
  const wallet = useTonWallet();
  const navigate = useNavigate();
  const { t } = useTranslation('login');
  const { sign, loading } = useTonSign();

  useEffect(() => {
    if (wallet) {
      navigate('/', { replace: true });
    }
  }, [wallet, navigate]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center text-text-primary">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-border bg-surface shadow-surface">
        <WalletIllustration width={48} height={48} className="text-accent" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="max-w-sm text-sm text-text-secondary">{t('connect')}</p>
      </div>
      {wallet ? (
        <button
          type="button"
          disabled={loading}
          onClick={async () => {
            try {
              await sign('Hello Taizhunle');
              window.alert(t('signSuccess'));
            } catch (err) {
              console.error(err);
              window.alert(t('signError'));
            }
          }}
          className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-contrast disabled:opacity-60"
        >
          {t('signTest')}
        </button>
      ) : (
        <TonConnectButton />
      )}
    </main>
  );
}
