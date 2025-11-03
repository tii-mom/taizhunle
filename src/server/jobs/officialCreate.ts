import cron from 'node-cron';
import config from '../../config/env.js';
import { createOfficialRainDrop, getActiveRainRecord } from '../services/officialRainService.js';
import { notifyAdmins, notifyChannel } from '../services/telegramService.js';

const timezone = process.env.CRON_TIMEZONE || 'UTC';

const MIN_DROP_TAI = Number(process.env.OFFICIAL_RAIN_MIN_DROP ?? 5_000);
const MAX_DROP_TAI = Number(process.env.OFFICIAL_RAIN_MAX_DROP ?? 100_000);
const MAX_PARTICIPANTS = Number(process.env.OFFICIAL_RAIN_MAX_PARTICIPANTS ?? 1_000);
const DURATION_MINUTES = Number(process.env.OFFICIAL_RAIN_DURATION_MINUTES ?? 120);

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatTai(value: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

async function sendNotifications(message: string): Promise<void> {
  await Promise.all([notifyAdmins(message), notifyChannel(message)]);
}

function randomAmountTai(): number {
  const min = Math.max(1, Math.round(MIN_DROP_TAI));
  const max = Math.max(min, Math.round(MAX_DROP_TAI));
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function shouldSkipCreation(): Promise<boolean> {
  const active = await getActiveRainRecord();
  if (!active) {
    return false;
  }

  const endTime = active.end_time ? new Date(active.end_time).getTime() : 0;
  if (active.status === 'active' && endTime > Date.now()) {
    console.log('ℹ️ Existing active official rain still running, skip new creation');
    return true;
  }

  return false;
}

async function handleOfficialRainCreation(): Promise<void> {
  if (!config.features.officialRainCreation) {
    console.log('ℹ️ Official rain creation feature disabled');
    return;
  }

  if (await shouldSkipCreation()) {
    return;
  }

  const amountTai = randomAmountTai();
  const ticketPrice = config.business.officialRain.ticketPrice || 0.3;
  const minBonus = Math.min(amountTai, Math.max(Math.round(amountTai * 0.02), 100));
  const maxBonus = Math.min(amountTai, Math.max(Math.round(amountTai * 0.08), minBonus));

  const rain = await createOfficialRainDrop({
    amountTai,
    ticketPriceTon: ticketPrice,
    minBonus,
    maxBonus,
    maxParticipants: MAX_PARTICIPANTS,
    durationMinutes: DURATION_MINUTES,
    status: 'active',
  });

  const totalAmount = toNumber(rain.amount_tai);
  const participants = Math.max(1, toNumber(rain.max_participants));
  const baseShare = Math.floor(totalAmount / participants);

  const message = [
    '🌧️ *官方雨露已生成*',
    '',
    `• 派发总额: ${formatTai(totalAmount)} TAI`,
    `• 门票价格: ${ticketPrice} TON`,
    `• 参与上限: ${participants} 人`,
    `• 单份基础金额: ${formatTai(baseShare)} TAI`,
    `• 随机奖励区间: ${formatTai(minBonus)} ~ ${formatTai(maxBonus)} TAI`,
  ].join('\n');

  await sendNotifications(message);
  console.log(`✅ Official rain created: ${formatTai(totalAmount)} TAI (max ${participants} participants)`);
}

export function startOfficialCreateJob(): void {
  cron.schedule(
    '0 12,14,18,22 * * *',
    async () => {
      console.log('🎁 Creating official rain drop...');
      try {
        await handleOfficialRainCreation();
      } catch (error) {
        console.error('❌ Official rain creation failed:', error);
      }
    },
    { timezone },
  );

  console.log(`⏰ Official rain job scheduled (12:00, 14:00, 18:00, 22:00) [timezone=${timezone}]`);
}
