export const REDPACKET_PAYMENT_ADDRESS = '0QCJ4DKMRFQoaT5tlQ3Eo9_GTI5UhmRVdUTfJwnR2xgMmuoT';
export const PURCHASE_EXPIRATION_MINUTES = 15;
export const DEFAULT_ACCELERATE_RATE = 10;
export const NORMAL_ACCELERATE_RATE = 5;

export const PURCHASE_STATUS = {
  pending: 'pending',
  awaitingSignature: 'awaiting_signature',
  completed: 'completed',
  failed: 'failed',
  expired: 'expired',
} as const;

export type PurchaseStatus = typeof PURCHASE_STATUS[keyof typeof PURCHASE_STATUS];
