type NumericValue = string | number;

type OptionalNumericValue = string | number | null;

type OptionalInteger = number | null;

export interface PredictionRow {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  end_time: string;
  settlement_time: string | null;
  status: string;
  result: string | null;
  base_pool: NumericValue;
  total_pool: NumericValue;
  yes_pool: NumericValue;
  no_pool: NumericValue;
  total_fees: NumericValue;
  creator_fee: NumericValue;
  platform_fee: NumericValue;
  admin_notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export type PredictionInsert = Partial<PredictionRow> & {
  title: string;
  description: string;
  creator_id: string;
  end_time: string;
};

export type PredictionUpdate = Partial<PredictionRow>;

export interface BetRow {
  id: string;
  prediction_id: string;
  user_id: string;
  side: 'yes' | 'no';
  amount: NumericValue;
  odds: NumericValue;
  potential_payout: NumericValue;
  fee_amount: NumericValue;
  net_amount: NumericValue;
  referrer_id: string | null;
  referrer_reward: OptionalNumericValue;
  status: string;
  payout_amount: OptionalNumericValue;
  tx_hash: string | null;
  block_number: OptionalNumericValue;
  created_at: string;
  settled_at: string | null;
}

export type BetInsert = Partial<BetRow> & {
  prediction_id: string;
  user_id: string;
  side: 'yes' | 'no';
  amount: NumericValue;
  odds: NumericValue;
  potential_payout: NumericValue;
  fee_amount: NumericValue;
  net_amount: NumericValue;
};

export type BetUpdate = Partial<BetRow>;

export interface UserRow {
  id: string;
  wallet_address: string;
  telegram_id: number | null;
  telegram_username: string | null;
  first_name: string | null;
  last_name: string | null;
  language_code: string | null;
  is_premium: boolean | null;
  total_bets: OptionalNumericValue;
  total_winnings: OptionalNumericValue;
  total_losses: OptionalNumericValue;
  win_rate: OptionalNumericValue;
  is_active: boolean | null;
  is_blacklisted: boolean | null;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

export type UserInsert = Partial<UserRow> & {
  wallet_address: string;
};

export type UserUpdate = Partial<UserRow>;

export interface OfficialRainRow {
  id: string;
  amount_tai: NumericValue;
  ticket_price_ton: NumericValue;
  min_bonus: NumericValue;
  max_bonus: NumericValue;
  total_participants: number;
  max_participants: number;
  total_distributed: NumericValue;
  start_time: string;
  end_time: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export type OfficialRainInsert = Partial<OfficialRainRow> & {
  amount_tai: NumericValue;
  ticket_price_ton: NumericValue;
  min_bonus: NumericValue;
  max_bonus: NumericValue;
  start_time: string;
};

export type OfficialRainUpdate = Partial<OfficialRainRow>;

export interface OfficialRainClaimRow {
  id: string;
  rain_id: string;
  user_id: string;
  has_purchased_redpacket: boolean;
  has_channel_activity: boolean;
  ticket_paid_ton: NumericValue;
  amount_received_tai: NumericValue;
  bonus_amount: NumericValue;
  payment_tx_hash: string | null;
  distribution_tx_hash: string | null;
  claimed_at: string;
  created_at: string;
  updated_at: string;
}

export type OfficialRainClaimInsert = Partial<OfficialRainClaimRow> & {
  rain_id: string;
  user_id: string;
  ticket_paid_ton: NumericValue;
  amount_received_tai: NumericValue;
};

export type OfficialRainClaimUpdate = Partial<OfficialRainClaimRow>;

export interface RedpacketSalesRow {
  id: string;
  sale_code: string | null;
  price_ton: NumericValue;
  base_tai: NumericValue;
  max_tai: NumericValue;
  total_tai: NumericValue;
  sold_tai: NumericValue;
  sold_out: boolean;
  accelerate: boolean;
  accelerate_rate: OptionalNumericValue;
  price_adjustment: number;
  price_adjusted_at: string | null;
  expires_at: string;
  start_at: string | null;
  memo_prefix: string | null;
  created_at: string;
  updated_at: string;
}

export type RedpacketSalesInsert = Partial<RedpacketSalesRow> & {
  price_ton?: NumericValue;
  base_tai?: NumericValue;
  max_tai?: NumericValue;
  total_tai?: NumericValue;
  expires_at?: string;
};

export type RedpacketSalesUpdate = Partial<RedpacketSalesRow>;

export interface RedpacketPurchaseRow {
  id: string;
  sale_id: string | null;
  user_id: string | null;
  wallet_address: string;
  customer_wallet: string | null;
  amount_tai: OptionalNumericValue;
  ton_amount: OptionalNumericValue;
  tx_hash: string | null;
  memo: string;
  status: string;
  reward_base_tai: OptionalNumericValue;
  reward_max_tai: OptionalNumericValue;
  payment_detected_at: string | null;
  unsigned_boc: string | null;
  expires_at: string | null;
  accelerate: boolean | null;
  error_reason: string | null;
  signature: string | null;
  tai_multiplier: OptionalNumericValue;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type RedpacketPurchaseInsert = Partial<RedpacketPurchaseRow> & {
  wallet_address: string;
  memo: string;
  status?: string;
};

export type RedpacketPurchaseUpdate = Partial<RedpacketPurchaseRow>;

export interface RedpacketClaimRow {
  id: string;
  redpacket_id: string;
  user_id: string;
  amount_tai: NumericValue;
  claim_rate: NumericValue;
  tx_hash: string | null;
  block_number: OptionalNumericValue;
  claimed_at: string;
}

export type RedpacketClaimInsert = Partial<RedpacketClaimRow> & {
  redpacket_id: string;
  user_id: string;
  amount_tai: NumericValue;
  claim_rate: NumericValue;
};

export type RedpacketClaimUpdate = Partial<RedpacketClaimRow>;

export interface UserBalanceRow {
  wallet_address: string;
  total_tai: NumericValue;
  available_tai: NumericValue;
  locked_tai: NumericValue;
  total_ton: NumericValue;
  created_at: string;
  updated_at: string;
}

export type UserBalanceInsert = Partial<UserBalanceRow> & {
  wallet_address: string;
};

export type UserBalanceUpdate = Partial<UserBalanceRow>;

export interface DaoPoolRow {
  id: string;
  pool_type: 'create' | 'jury' | 'invite' | 'platform' | 'reserve';
  amount: NumericValue;
  bet_id: string;
  user_id: string | null;
  wallet_address: string | null;
  status: 'pending' | 'claimed' | 'expired';
  claimed_at: string | null;
  tx_hash: string | null;
  created_at: string;
  updated_at: string;
}

export type DaoPoolInsert = Partial<DaoPoolRow> & {
  pool_type: DaoPoolRow['pool_type'];
  amount: NumericValue;
  bet_id: string;
};

export type DaoPoolUpdate = Partial<DaoPoolRow>;

export interface UserDaoStatsRow {
  user_id: string;
  wallet_address: string | null;
  create_count: OptionalInteger;
  jury_count: OptionalInteger;
  invite_count: OptionalInteger;
  pending_amount: OptionalNumericValue;
  claimed_amount: OptionalNumericValue;
  total_amount: OptionalNumericValue;
  last_earning_at: string | null;
  last_claim_at: string | null;
}

export interface Database {
  public: {
    Tables: {
      predictions: {
        Row: PredictionRow;
        Insert: PredictionInsert;
        Update: PredictionUpdate;
        Relationships: [];
      };
      bets: {
        Row: BetRow;
        Insert: BetInsert;
        Update: BetUpdate;
        Relationships: [];
      };
      users: {
        Row: UserRow;
        Insert: UserInsert;
        Update: UserUpdate;
        Relationships: [];
      };
      redpacket_sales: {
        Row: RedpacketSalesRow;
        Insert: RedpacketSalesInsert;
        Update: RedpacketSalesUpdate;
        Relationships: [];
      };
      redpacket_purchases: {
        Row: RedpacketPurchaseRow;
        Insert: RedpacketPurchaseInsert;
        Update: RedpacketPurchaseUpdate;
        Relationships: [];
      };
      redpacket_claims: {
        Row: RedpacketClaimRow;
        Insert: RedpacketClaimInsert;
        Update: RedpacketClaimUpdate;
        Relationships: [];
      };
      user_balances: {
        Row: UserBalanceRow;
        Insert: UserBalanceInsert;
        Update: UserBalanceUpdate;
        Relationships: [];
      };
      official_rain: {
        Row: OfficialRainRow;
        Insert: OfficialRainInsert;
        Update: OfficialRainUpdate;
        Relationships: [];
      };
      official_rain_claims: {
        Row: OfficialRainClaimRow;
        Insert: OfficialRainClaimInsert;
        Update: OfficialRainClaimUpdate;
        Relationships: [];
      };
      dao_pool: {
        Row: DaoPoolRow;
        Insert: DaoPoolInsert;
        Update: DaoPoolUpdate;
        Relationships: [];
      };
      redpacket_sale_snapshot: {
        Row: RedpacketSalesRow;
        Insert: RedpacketSalesInsert;
        Update: RedpacketSalesUpdate;
        Relationships: [];
      };
    };
    Views: {
      redpacket_sale_snapshot: {
        Row: RedpacketSalesRow;
      };
      mv_user_dao_stats: {
        Row: UserDaoStatsRow;
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
