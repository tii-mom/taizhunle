import { AssetTransactionModal } from '../assets/AssetTransactionModal';

type Props = {
  open: boolean;
  balance: number;
  onClose: () => void;
  onSubmit: (values: { amount: number; fromCurrency?: string; toCurrency?: string }) => Promise<void> | void;
};

export function ExchangeModalGlass({ open, balance, onClose, onSubmit }: Props) {
  return <AssetTransactionModal open={open} variant="exchange" balance={balance} onClose={onClose} onSubmit={onSubmit} />;
}
