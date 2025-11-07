/**
 * TON 区块链服务
 * TON Blockchain Service
 */

import { config } from '../config/env.js';

// TON API 响应类型
interface TonApiResponse<T = any> {
  ok: boolean;
  result?: T;
  error?: string;
}

interface AddressInfo {
  balance: string;
  state: 'active' | 'uninitialized' | 'frozen';
  last_transaction_id?: {
    lt: string;
    hash: string;
  };
}

interface Transaction {
  utime: number;
  data: string;
  transaction_id: {
    lt: string;
    hash: string;
  };
  fee: string;
  in_msg?: {
    source: string;
    destination: string;
    value: string;
    body?: string;
  };
  out_msgs: Array<{
    source: string;
    destination: string;
    value: string;
    body?: string;
  }>;
}

type MasterchainInfo = Record<string, unknown>;

class TonService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = config.ton.apiEndpoint;
    this.apiKey = config.ton.apiKey;
  }

  /**
   * 发送 API 请求
   */
  private async request<T>(method: string, params: Record<string, any> = {}): Promise<T> {
    const url = new URL(method, this.baseUrl);
    
    // 添加 API Key
    url.searchParams.append('api_key', this.apiKey);
    
    // 添加其他参数
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    try {
      const response = await fetch(url.toString());
      const data: TonApiResponse<T> = await response.json();
      
      if (!data.ok) {
        throw new Error(data.error || 'TON API request failed');
      }
      
      return data.result as T;
    } catch (error) {
      console.error('TON API 请求失败:', error);
      throw error;
    }
  }

  /**
   * 获取地址信息
   */
  async getAddressInfo(address: string): Promise<AddressInfo> {
    return this.request<AddressInfo>('getAddressInformation', { address });
  }

  /**
   * 获取地址余额 (TON)
   */
  async getBalance(address: string): Promise<number> {
    const info = await this.getAddressInfo(address);
    return parseInt(info.balance) / 1e9; // 转换为 TON
  }

  /**
   * 获取地址交易历史
   */
  async getTransactions(
    address: string, 
    limit: number = 10,
    lt?: string,
    hash?: string
  ): Promise<Transaction[]> {
    const params: Record<string, any> = {
      address,
      limit,
    };
    
    if (lt && hash) {
      params.lt = lt;
      params.hash = hash;
    }
    
    return this.request<Transaction[]>('getTransactions', params);
  }

  /**
   * 监听地址的新交易
   */
  async *watchTransactions(address: string, intervalMs: number = 5000) {
    let lastLt: string | undefined;
    let lastHash: string | undefined;
    
    while (true) {
      try {
        const transactions = await this.getTransactions(address, 10, lastLt, lastHash);
        
        if (transactions.length > 0) {
          // 返回新交易
          for (const tx of transactions) {
            yield tx;
          }
          
          // 更新最后的交易 ID
          const latest = transactions[0];
          lastLt = latest.transaction_id.lt;
          lastHash = latest.transaction_id.hash;
        }
        
        // 等待下次检查
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      } catch (error) {
        console.error('监听交易失败:', error);
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }
  }

  /**
   * 验证交易是否包含指定的 memo
   */
  validateTransactionMemo(transaction: Transaction, expectedMemo: string): boolean {
    try {
      // 检查入账消息的 body
      if (transaction.in_msg?.body) {
        const body = transaction.in_msg.body;
        // 简单的 memo 检查 (实际实现需要解析 TON 消息格式)
        return body.includes(expectedMemo);
      }
      return false;
    } catch (error) {
      console.error('验证 memo 失败:', error);
      return false;
    }
  }

  /**
   * 检查支付是否完成
   */
  async checkPayment(
    toAddress: string,
    expectedAmount: number, // TON
    memo: string,
    timeoutMs: number = 300000 // 5分钟超时
  ): Promise<Transaction | null> {
    const startTime = Date.now();
    const expectedAmountNano = Math.floor(expectedAmount * 1e9);
    
    console.log(`开始监听支付: ${expectedAmount} TON 到 ${toAddress}, memo: ${memo}`);
    
    try {
      for await (const transaction of this.watchTransactions(toAddress, 3000)) {
        // 检查超时
        if (Date.now() - startTime > timeoutMs) {
          console.log('支付监听超时');
          break;
        }
        
        // 检查金额
        if (transaction.in_msg) {
          const receivedAmount = parseInt(transaction.in_msg.value);
          
          if (receivedAmount >= expectedAmountNano) {
            // 检查 memo
            if (this.validateTransactionMemo(transaction, memo)) {
              console.log('支付验证成功:', transaction.transaction_id.hash);
              return transaction;
            }
          }
        }
      }
    } catch (error) {
      console.error('支付检查失败:', error);
    }
    
    return null;
  }

  /**
   * 生成支付链接
   */
  generatePaymentLink(
    toAddress: string,
    amount: number, // TON
    memo: string,
    comment?: string
  ): string {
    const amountNano = Math.floor(amount * 1e9);
    
    const params = new URLSearchParams({
      to: toAddress,
      amount: amountNano.toString(),
      text: memo,
    });
    
    if (comment) {
      params.append('comment', comment);
    }
    
    return `ton://transfer/${toAddress}?${params.toString()}`;
  }

  /**
   * 获取当前网络信息
   */
  async getNetworkInfo() {
    try {
      const info = await this.request<MasterchainInfo>('getMasterchainInfo');
      return {
        network: config.ton.network,
        isTestnet: config.ton.network === 'testnet',
        ...info,
      };
    } catch (error) {
      console.error('获取网络信息失败:', error);
      return {
        network: config.ton.network,
        isTestnet: config.ton.network === 'testnet',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// 创建单例实例
export const tonService = new TonService();

// 导出类型
export type { AddressInfo, Transaction, TonApiResponse };

// 导出工具函数
export const tonUtils = {
  /**
   * 将 nanoTON 转换为 TON
   */
  nanoToTon(nano: string | number): number {
    return parseInt(String(nano)) / 1e9;
  },

  /**
   * 将 TON 转换为 nanoTON
   */
  tonToNano(ton: number): string {
    return Math.floor(ton * 1e9).toString();
  },

  /**
   * 格式化 TON 金额
   */
  formatTon(amount: number, decimals: number = 2): string {
    return amount.toFixed(decimals);
  },

  /**
   * 验证 TON 地址格式
   */
  isValidAddress(address: string): boolean {
    // 简单的地址格式验证
    return /^[A-Za-z0-9_-]{48}$/.test(address) || /^[A-Za-z0-9_-]{48}$/.test(address);
  },

  /**
   * 生成随机 memo
   */
  generateMemo(): string {
    return `taizhunle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
};

export default tonService;
