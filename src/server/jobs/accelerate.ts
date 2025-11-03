import cron from 'node-cron';
import config from '../../config/env.js';
import { DEFAULT_ACCELERATE_RATE, NORMAL_ACCELERATE_RATE } from '../constants/redpacket.js';
import { ensureSaleRecord, setSaleAccelerationState } from '../services/redpacketService.js';
import { notifyAdmins, notifyChannel } from '../services/telegramService.js';

const timezone = process.env.CRON_TIMEZONE || 'UTC';

async function sendNotifications(message: string): Promise<void> {
  await Promise.all([notifyAdmins(message), notifyChannel(message)]);
}

function resolveRates() {
  const boostRate = config.business.redpacket.accelerateRate?.boost ?? DEFAULT_ACCELERATE_RATE;
  const normalRate = config.business.redpacket.accelerateRate?.normal ?? NORMAL_ACCELERATE_RATE;
  return { boostRate, normalRate };
}

async function handleAccelerationStart(): Promise<void> {
  const { boostRate } = resolveRates();
  const sale = await ensureSaleRecord();

  if (sale.accelerate && Math.round(Number(sale.accelerateRate ?? boostRate)) === Math.round(boostRate)) {
    console.log('ℹ️ Acceleration already active for current sale');
    return;
  }

  const updatedSale = await setSaleAccelerationState({
    saleId: sale.id,
    active: true,
    accelerateRate: boostRate,
  });

  const message = [
    '⚡ *红包加速期已开启*',
    '',
    `• 销售编号: ${updatedSale.saleCode ?? 'N/A'}`,
    `• 当前裂变系数: ${boostRate}%`,
    '• 时间窗口: 20:00 - 24:00 (UTC+时间以 CRON_TIMEZONE 为准)',
  ].join('\n');

  await sendNotifications(message);
  console.log(`✅ Acceleration started for sale ${updatedSale.id} (rate ${boostRate}%)`);
}

async function handleAccelerationEnd(): Promise<void> {
  const { normalRate } = resolveRates();
  const sale = await ensureSaleRecord();

  if (!sale.accelerate) {
    console.log('ℹ️ Acceleration already disabled for current sale');
    return;
  }

  const updatedSale = await setSaleAccelerationState({
    saleId: sale.id,
    active: false,
    accelerateRate: normalRate,
  });

  const message = [
    '⏹️ *红包加速期已结束*',
    '',
    `• 销售编号: ${updatedSale.saleCode ?? 'N/A'}`,
    `• 恢复裂变系数: ${normalRate}%`,
  ].join('\n');

  await sendNotifications(message);
  console.log(`✅ Acceleration ended for sale ${updatedSale.id} (rate ${normalRate}%)`);
}

export function startAccelerateJob(): void {
  cron.schedule(
    '0 20 * * *',
    async () => {
      console.log('⚡ Starting acceleration period (20:00-24:00)...');
      try {
        await handleAccelerationStart();
      } catch (error) {
        console.error('❌ Acceleration job failed:', error);
      }
    },
    { timezone },
  );

  cron.schedule(
    '0 0 * * *',
    async () => {
      console.log('⏹️ Ending acceleration period...');
      try {
        await handleAccelerationEnd();
      } catch (error) {
        console.error('❌ Acceleration end job failed:', error);
      }
    },
    { timezone },
  );

  console.log(`⏰ Acceleration jobs scheduled (20:00 start, 00:00 end) [timezone=${timezone}]`);
}
