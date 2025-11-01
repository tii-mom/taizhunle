export interface RedpacketSalesRow {
  id: string;
  sale_code: string | null;
  price_ton: string | number;
  base_tai: number;
  max_tai: number;
  total_tai: number;
  sold_tai: number;
  sold_out: boolean;
  accelerate: boolean;
  accelerate_rate: string | number | null;
  price_adjustment: number;
  price_adjusted_at: string | null;
  expires_at: string;
  start_at: string | null;
  memo_prefix: string | null;
  created_at: string;
  updated_at: string;
}

export type RedpacketSalesInsert = Partial<RedpacketSalesRow> & {
  price_ton?: string | number;
  base_tai?: number;
  max_tai?: number;
  total_tai?: number;
  expires_at?: string;
};

export type RedpacketSalesUpdate = Partial<RedpacketSalesRow>;

export interface RedpacketPurchaseRow {
  id: string;
  sale_id: string | null;
  wallet_address: string;
  customer_wallet: string | null;
  amount_tai: number | null;
  ton_amount: string | number | null;
  tx_hash: string | null;
  memo: string;
  status: string;
  reward_base_tai: number | null;
  reward_max_tai: number | null;
  payment_detected_at: string | null;
  unsigned_boc: string | null;
  expires_at: string | null;
  accelerate: boolean | null;
  error_reason: string | null;
  signature: string | null;
  tai_multiplier: string | number | null;
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

export interface UserBalanceRow {
  wallet_address: string;
  total_tai: number;
  available_tai: number;
  locked_tai: number;
  total_ton: string | number;
  created_at: string;
  updated_at: string;
}

export type UserBalanceInsert = Partial<UserBalanceRow> & {
  wallet_address: string;
};

export type UserBalanceUpdate = Partial<UserBalanceRow>;

export interface Database {
  public: {
    Tables: {
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
      user_balances: {
        Row: UserBalanceRow;
        Insert: UserBalanceInsert;
        Update: UserBalanceUpdate;
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
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
