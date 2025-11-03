import TelegramBot from 'node-telegram-bot-api';
import { createMockBot, MockTelegramBot } from './mockBot.js';

let bot: TelegramBot | MockTelegramBot | null = null;
let isMockBot = false;

// 管理员权限检查
const isAdmin = (userId: number): boolean => {
  const adminIds = process.env.TELEGRAM_ADMIN_IDS?.split(',').map(id => parseInt(id.trim())) || [];
  return adminIds.includes(userId);
};

// 频道成员检查
const checkChannelMembership = async (userId: number): Promise<boolean> => {
  if (!bot) return false;
  
  const channelId = process.env.TELEGRAM_CHANNEL_ID;
  if (!channelId) return false;
  
  try {
    const member = await bot.getChatMember(channelId, userId);
    return ['member', 'administrator', 'creator'].includes(member.status);
  } catch (error) {
    console.error('检查频道成员失败:', error);
    return false;
  }
};

// 发送管理员通知
const notifyAdmins = async (message: string) => {
  if (!bot) return;
  
  const adminIds = process.env.TELEGRAM_ADMIN_IDS?.split(',').map(id => parseInt(id.trim())) || [];
  
  for (const adminId of adminIds) {
    try {
      await bot.sendMessage(adminId, message);
    } catch (error) {
      console.error(`发送通知给管理员 ${adminId} 失败:`, error);
    }
  }
};

export function startTelegramBot() {
  const botToken = process.env.TELEGRAM_ADMIN_BOT_TOKEN;
  
  if (!botToken || botToken.includes('test') || botToken.includes('placeholder')) {
    console.warn('⚠️ TELEGRAM_ADMIN_BOT_TOKEN not set or using placeholder');
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Starting mock bot for development...');
      bot = createMockBot();
      isMockBot = true;
    } else {
      console.log('📝 To enable bot:');
      console.log('1. Message @BotFather on Telegram');
      console.log('2. Create a new bot with /newbot');
      console.log('3. Copy the token to .env TELEGRAM_ADMIN_BOT_TOKEN');
      return;
    }
  } else {
    try {
      bot = new TelegramBot(botToken, { 
        polling: process.env.NODE_ENV === 'development',
        webHook: process.env.NODE_ENV !== 'development'
      });
      isMockBot = false;
      console.log('🤖 Real Telegram bot initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Telegram bot:', error);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Falling back to mock bot...');
        bot = createMockBot();
        isMockBot = true;
      } else {
        return;
      }
    }
  }

  // 🎯 用户命令
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    
    if (!userId) return;
    
    const welcomeMessage = `
🎯 欢迎使用 Taizhunle (太准了)！

🎲 TON 区块链预测市场 DApp
🧧 红包系统 | 🌧️ 官方雨露 | 🏆 排行榜

🔗 打开应用: https://taizhunle.vercel.app
📱 Telegram Mini App 即将上线

💡 输入 /help 查看更多命令
    `;
    
    await bot?.sendMessage(chatId, welcomeMessage);
    console.log(`用户 ${userId} 启动了 Bot`);
  });

  bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    
    if (!userId) return;
    
    const isUserAdmin = isAdmin(userId);
    
    let helpText = `
🤖 Taizhunle Bot 命令:

👤 用户命令:
/start - 启动 Bot
/help - 显示帮助
/status - 查看状态
/soldout - 查看红包销售状态
/next - 查看下轮官方雨露时间
    `;
    
    if (isUserAdmin) {
      helpText += `

🔧 管理员命令:
/stats - 实时统计数据
/price - 查看当前红包价格
/accelerate - 查看加速期状态
/pending - 查看待审核预测
/approve <id> - 通过预测
/reject <id> <reason> - 拒绝预测
/settle <id> <result> - 结算预测
      `;
    }
    
    await bot?.sendMessage(chatId, helpText);
  });

  // 📊 状态查询
  bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id;
    
    const statusMessage = `
📊 Taizhunle 系统状态:

🟢 服务器: 运行中
🟢 数据库: 连接正常
🟢 TON 网络: ${process.env.TON_NETWORK || 'testnet'}
🟢 红包价格: ${process.env.REDPACKET_PRICE_TON || '9.99'} TON

⏰ 最后更新: ${new Date().toLocaleString('zh-CN')}
    `;
    
    await bot?.sendMessage(chatId, statusMessage);
  });

  // 🧧 红包销售状态
  bot.onText(/\/soldout/, async (msg) => {
    const chatId = msg.chat.id;
    
    // TODO: 从数据库获取真实数据
    const mockData = {
      totalSold: 1500000,
      threshold: 8000000000,
      currentPrice: parseFloat(process.env.REDPACKET_PRICE_TON || '9.99'),
      isAccelerate: false,
    };
    
    const percentage = (mockData.totalSold / mockData.threshold * 100).toFixed(2);
    
    const statusMessage = `
🧧 红包销售状态:

💰 当前价格: ${mockData.currentPrice} TON
📊 销售进度: ${percentage}% (${mockData.totalSold.toLocaleString()} / ${mockData.threshold.toLocaleString()} TAI)
⚡ 加速期: ${mockData.isAccelerate ? '进行中 (10%)' : '未开始 (5%)'}
🎯 状态: ${percentage === '100.00' ? '已售罄' : '销售中'}

⏰ 更新时间: ${new Date().toLocaleString('zh-CN')}
    `;
    
    await bot?.sendMessage(chatId, statusMessage);
  });

  // 🌧️ 官方雨露时间
  bot.onText(/\/next/, async (msg) => {
    const chatId = msg.chat.id;
    
    const now = new Date();
    const rainTimes = [12, 14, 18, 22];
    const currentHour = now.getHours();
    
    let nextHour = rainTimes.find(hour => hour > currentHour);
    if (!nextHour) {
      nextHour = rainTimes[0];
    }
    
    const nextRain = new Date();
    if (nextHour <= currentHour) {
      nextRain.setDate(nextRain.getDate() + 1);
    }
    nextRain.setHours(nextHour, 0, 0, 0);
    
    const timeUntil = Math.ceil((nextRain.getTime() - now.getTime()) / (1000 * 60));
    
    const rainMessage = `
🌧️ 官方雨露时间:

⏰ 下轮时间: ${nextRain.toLocaleString('zh-CN')}
⏳ 倒计时: ${Math.floor(timeUntil / 60)}小时${timeUntil % 60}分钟

💰 奖励金额: 1000万 TAI
🎫 门票价格: 0.3 TON
👥 参与资格: 买过红包 + 近3天频道发言

📅 每日时间: 12:00 | 14:00 | 18:00 | 22:00
    `;
    
    await bot?.sendMessage(chatId, rainMessage);
  });

  // 🔧 管理员命令
  bot.onText(/\/stats/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    
    if (!userId || !isAdmin(userId)) {
      await bot?.sendMessage(chatId, '❌ 权限不足，仅管理员可用');
      return;
    }
    
    // TODO: 从数据库获取真实统计数据
    const stats = {
      totalUsers: 1250,
      totalBets: 45600000,
      totalRevenue: 2280,
      activePredictions: 8,
      redpacketSales: 156,
      todayProfit: 340,
    };
    
    const statsMessage = `
📊 实时统计数据:

👥 总用户数: ${stats.totalUsers.toLocaleString()}
🎯 总下注额: ${stats.totalBets.toLocaleString()} TAI
💰 总收入: ${stats.totalRevenue.toLocaleString()} TON
📈 今日利润: ${stats.todayProfit.toLocaleString()} TON

🎲 活跃预测: ${stats.activePredictions}
🧧 红包销售: ${stats.redpacketSales}

⏰ 更新时间: ${new Date().toLocaleString('zh-CN')}
    `;
    
    await bot?.sendMessage(chatId, statsMessage);
  });

  bot.onText(/\/price/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    if (!userId || !isAdmin(userId)) {
      await bot?.sendMessage(chatId, '❌ 权限不足，仅管理员可用');
      return;
    }

    const priceMessage = `
💰 红包价格信息:

🏷️ 当前价格: ${process.env.REDPACKET_PRICE_TON || '9.99'} TON
📊 基础金额: ${parseInt(process.env.REDPACKET_BASE_AMOUNT || '10000').toLocaleString()} TAI
🎯 最大金额: ${parseInt(process.env.REDPACKET_MAX_AMOUNT || '200000').toLocaleString()} TAI

⚡ 裂变系数:
- 正常时期: ${process.env.REDPACKET_ACCELERATE_RATE_NORMAL || '5'}%
- 加速时期: ${process.env.REDPACKET_ACCELERATE_RATE_BOOST || '10'}%

📅 加速时间: 每日 20:00 - 24:00
    `;

    await bot?.sendMessage(chatId, priceMessage);
  });

  bot.onText(/\/accelerate/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    if (!userId || !isAdmin(userId)) {
      await bot?.sendMessage(chatId, '❌ 权限不足，仅管理员可用');
      return;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const isAccelerateTime = currentHour >= 20 || currentHour < 0;
    
    const accelerateMessage = `
⚡ 加速期状态:

🕐 当前时间: ${now.toLocaleString('zh-CN')}
📊 当前系数: ${isAccelerateTime ? (process.env.REDPACKET_ACCELERATE_RATE_BOOST || '10') : (process.env.REDPACKET_ACCELERATE_RATE_NORMAL || '5')}%
🎯 状态: ${isAccelerateTime ? '加速期进行中' : '正常时期'}

⏰ 加速时间: 每日 20:00 - 24:00
📈 系数变化: 5% → 10%
    `;

    await bot?.sendMessage(chatId, accelerateMessage);
  });

  // 错误处理 (仅对真实 Bot)
  if (!isMockBot && bot instanceof TelegramBot) {
    bot.on('polling_error', (error) => {
      console.error('Bot polling 错误:', error);
    });

    bot.on('webhook_error', (error) => {
      console.error('Bot webhook 错误:', error);
    });
  }

  if (isMockBot) {
    console.log('🤖 Mock Telegram bot started (development mode)');
    // 在开发模式下，可以通过控制台测试命令
    setTimeout(() => {
      console.log('\n🎯 Testing mock bot commands...');
      (bot as MockTelegramBot).simulateCommand('start');
      (bot as MockTelegramBot).simulateCommand('help');
      (bot as MockTelegramBot).simulateCommand('status');
    }, 2000);
  } else {
    console.log('🤖 Real Telegram bot started');
  }
}

export function sendChannelNotification(message: string) {
  const channelId = process.env.TELEGRAM_CHANNEL_ID;
  if (!bot || !channelId) {
    console.warn('⚠️ Cannot send notification: bot or channel not configured');
    return;
  }

  if (isMockBot) {
    console.log('📢 Mock channel notification:');
    console.log(`Channel: ${channelId}`);
    console.log(`Message: ${message}`);
    return;
  }

  bot.sendMessage(channelId, message).catch((error) => {
    console.error('❌ Failed to send channel notification:', error);
  });
}

// 导出工具函数
export { bot, isAdmin, checkChannelMembership, notifyAdmins };
