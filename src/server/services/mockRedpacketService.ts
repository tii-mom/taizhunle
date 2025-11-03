// Mock 红包服务，用于开发环境测试

export interface RedpacketStatus {
  priceTON: number;
  soldTAI: number;
  totalTAI: number;
  countdown: number;
  soldOut: boolean;
  accelerate: boolean;
  priceAdjustment: number;
}

export interface PurchaseSession {
  purchaseId: string;
  address: string;
  memo: string;
  priceTON: number;
  baseTAI: number;
  maxTAI: number;
  expiresAt: number;
  accelerate: boolean;
}

export interface PurchaseSignaturePayload {
  purchaseId: string;
  unsignedBoc: string;
  amountTAI: number;
  tonAmount: number;
  memo: string;
  accelerate: boolean;
  multiplier: number;
}

// Mock 数据
const mockSale = {
  id: 'mock-sale-001',
  priceTon: 9.99,
  baseTai: 700000,
  maxTai: 1300000,
  totalTai: 1000000,
  soldTai: 156000,
  soldOut: false,
  accelerate: false,
  priceAdjustment: 0,
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24小时后
};

const mockPurchases = new Map<string, any>();

export async function getCurrentSaleStatus(): Promise<RedpacketStatus> {
  console.log('📦 使用 Mock 红包状态');
  
  return {
    priceTON: mockSale.priceTon,
    soldTAI: mockSale.soldTai,
    totalTAI: mockSale.totalTai,
    countdown: new Date(mockSale.expiresAt).getTime(),
    soldOut: mockSale.soldOut,
    accelerate: mockSale.accelerate,
    priceAdjustment: mockSale.priceAdjustment,
  };
}

export async function createPurchaseSession(wallet: string): Promise<PurchaseSession> {
  console.log('📦 创建 Mock 购买会话:', wallet);
  
  const purchaseId = `mock-purchase-${Date.now()}`;
  const memo = `RP-${Date.now().toString(36).toUpperCase()}`;
  
  const session = {
    purchaseId,
    address: 'EQD_mock_payment_address_for_development',
    memo,
    priceTON: mockSale.priceTon,
    baseTAI: mockSale.baseTai,
    maxTAI: mockSale.maxTai,
    expiresAt: Date.now() + 30 * 60 * 1000, // 30分钟
    accelerate: mockSale.accelerate,
  };
  
  mockPurchases.set(memo, {
    ...session,
    wallet,
    status: 'pending',
    createdAt: Date.now(),
  });
  
  return session;
}

export async function getPurchaseForWallet(wallet: string, memo: string): Promise<PurchaseSignaturePayload | null> {
  console.log('📦 获取 Mock 购买信息:', wallet, memo);
  
  const purchase = mockPurchases.get(memo);
  if (!purchase || purchase.wallet !== wallet) {
    return null;
  }
  
  // 模拟支付已检测到，返回签名数据
  return {
    purchaseId: purchase.purchaseId,
    unsignedBoc: 'mock-unsigned-boc-data-for-development',
    amountTAI: purchase.baseTAI,
    tonAmount: purchase.priceTON,
    memo,
    accelerate: purchase.accelerate,
    multiplier: purchase.accelerate ? 1.86 : 1.0,
  };
}

export async function markPurchaseCompleted(purchaseId: string, signature: string): Promise<void> {
  console.log('📦 标记 Mock 购买完成:', purchaseId, signature);
  
  // 更新 mock 数据
  for (const purchase of mockPurchases.values()) {
    if (purchase.purchaseId === purchaseId) {
      purchase.status = 'completed';
      purchase.signature = signature;
      purchase.completedAt = Date.now();
      
      // 更新销售统计
      mockSale.soldTai += purchase.baseTAI;
      if (mockSale.soldTai >= mockSale.totalTai) {
        mockSale.soldOut = true;
      }
      
      console.log('✅ Mock 购买完成，更新销售统计');
      break;
    }
  }
}

export function getPaymentAddress(): string {
  return 'EQD_mock_payment_address_for_development';
}
