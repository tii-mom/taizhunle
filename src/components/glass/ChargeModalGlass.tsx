import { AssetTransactionModal } from '../assets/AssetTransactionModal';

type Props = {
  open: boolean;
  balance: number;
  onClose: () => void;
  onSubmit: (values: { amount: number }) => Promise<void> | void;
};

export function ChargeModalGlass({ open, balance, onClose, onSubmit }: Props) {
  return <AssetTransactionModal open={open} variant="charge" balance={balance} onClose={onClose} onSubmit={onSubmit} />;
}
