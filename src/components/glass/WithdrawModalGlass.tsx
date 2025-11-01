import { AssetTransactionModal } from '../assets/AssetTransactionModal';

type Props = {
  open: boolean;
  balance: number;
  onClose: () => void;
  onSubmit: (values: { amount: number; address?: string }) => Promise<void> | void;
};

export function WithdrawModalGlass({ open, balance, onClose, onSubmit }: Props) {
  return <AssetTransactionModal open={open} variant="withdraw" balance={balance} onClose={onClose} onSubmit={onSubmit} />;
}
