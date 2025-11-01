/**
 * DAO Claim Bot Command
 * DAO 领取指令 - 用户通过 Bot 领取 DAO 收益
 */

import TelegramBot from 'node-telegram-bot-api';
import { getUserPendingDao, claimDaoPool, getUserDaoStats } from '../services/feeDistributor';

/**
 * 注册 DAO 相关指令
 * @param bot Telegram Bot 实例
 */
export function registerDaoCommands(bot: TelegramBot) {
  // /dao - 查看 DAO 收益
  bot.onText(/\/dao/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id.toString();

    if (!userId) {
      await bot.sendMessage(chatId, '❌ 无法获取用户信息');
      return;
    }

    try {
      const stats = await getUserDaoStats(userId);

      if (!stats) {
        await bot.sendMessage(
          chatId,
          '📊 *DAO 收益池*\n\n' +
            '暂无收益数据\n\n' +
            '💡 参与创建、陪审、邀请即可获得 DAO 收益',
          { parse_mode: 'Markdown' },
        );
        return;
      }

      const message =
        '📊 *DAO 收益池*\n\n' +
        `💰 可领取：*${stats.pending_amount?.toLocaleString() || 0} TAI*\n` +
        `✅ 已领取：${stats.claimed_amount?.toLocaleString() || 0} TAI\n` +
        `📈 累计收益：${stats.total_amount?.toLocaleString() || 0} TAI\n\n` +
        `📝 贡献统计：\n` +
        `   • 创建：${stats.create_count || 0} 次\n` +
        `   • 陪审：${stats.jury_count || 0} 次\n` +
        `   • 邀请：${stats.invite_count || 0} 次\n\n` +
        `💡 使用 /claimDao 一键领取所有收益`;

      await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('DAO stats error:', error);
      await bot.sendMessage(chatId, '❌ 获取 DAO 数据失败，请稍后重试');
    }
  });

  // /claimDao - 领取 DAO 收益
  bot.onText(/\/claimDao/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id.toString();

    if (!userId) {
      await bot.sendMessage(chatId, '❌ 无法获取用户信息');
      return;
    }

    try {
      // 获取待领取金额
      const pendingAmount = await getUserPendingDao(userId);

      if (pendingAmount === 0) {
        await bot.sendMessage(chatId, '💰 暂无可领取的 DAO 收益\n\n💡 参与创建、陪审、邀请即可获得收益');
        return;
      }

      // 确认领取
      await bot.sendMessage(
        chatId,
        `💰 *待领取收益*\n\n` +
          `金额：*${pendingAmount.toLocaleString()} TAI*\n\n` +
          `⚠️ 领取需要支付 Gas 费（约 0.05 TON）\n\n` +
          `确认领取？`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '✅ 确认领取', callback_data: `dao_claim_confirm_${userId}` },
                { text: '❌ 取消', callback_data: 'dao_claim_cancel' },
              ],
            ],
          },
        },
      );
    } catch (error) {
      console.error('DAO claim error:', error);
      await bot.sendMessage(chatId, '❌ 领取失败，请稍后重试');
    }
  });

  // 处理领取确认回调
  bot.on('callback_query', async (query) => {
    const chatId = query.message?.chat.id;
    const data = query.data;

    if (!chatId || !data) return;

    // 取消领取
    if (data === 'dao_claim_cancel') {
      await bot.editMessageText('❌ 已取消领取', {
        chat_id: chatId,
        message_id: query.message?.message_id,
      });
      await bot.answerCallbackQuery(query.id);
      return;
    }

    // 确认领取
    if (data.startsWith('dao_claim_confirm_')) {
      const userId = data.replace('dao_claim_confirm_', '');

      try {
        // 模拟交易哈希（实际应该调用链上合约）
        const txHash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;

        // 领取收益
        const claimedAmount = await claimDaoPool(userId, txHash);

        if (claimedAmount > 0) {
          await bot.editMessageText(
            `✅ *领取成功！*\n\n` +
              `金额：*${claimedAmount.toLocaleString()} TAI*\n` +
              `交易：\`${txHash}\`\n\n` +
              `🎉 收益已到账，感谢您对 DAO 的贡献！`,
            {
              chat_id: chatId,
              message_id: query.message?.message_id,
              parse_mode: 'Markdown',
            },
          );
        } else {
          await bot.editMessageText('❌ 领取失败：暂无可领取收益', {
            chat_id: chatId,
            message_id: query.message?.message_id,
          });
        }
      } catch (error) {
        console.error('DAO claim execution error:', error);
        await bot.editMessageText('❌ 领取失败，请稍后重试', {
          chat_id: chatId,
          message_id: query.message?.message_id,
        });
      }

      await bot.answerCallbackQuery(query.id);
    }
  });
}

/**
 * 发送 DAO 收益通知
 * @param bot Telegram Bot 实例
 * @param userId 用户 ID
 * @param amount 收益金额
 * @param type 收益类型
 */
export async function sendDaoEarningNotification(
  bot: TelegramBot,
  userId: string,
  amount: number,
  type: 'create' | 'jury' | 'invite',
) {
  const typeNames = {
    create: '创建者',
    jury: '陪审员',
    invite: '邀请者',
  };

  const typeEmojis = {
    create: '🎨',
    jury: '⚖️',
    invite: '🤝',
  };

  const message =
    `${typeEmojis[type]} *${typeNames[type]}收益到账*\n\n` +
    `金额：*${amount.toLocaleString()} TAI*\n\n` +
    `💡 使用 /dao 查看详情\n` +
    `💰 使用 /claimDao 一键领取`;

  try {
    await bot.sendMessage(userId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Failed to send DAO earning notification:', error);
  }
}
