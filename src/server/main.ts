import './index';
import { startTelegramBot } from './bot';
import { startPriceAdjustJob } from './jobs/priceAdjust';
import { startAccelerateJob } from './jobs/accelerate';
import { startOfficialCreateJob } from './jobs/officialCreate';

// Start background jobs
startPriceAdjustJob();
startAccelerateJob();
startOfficialCreateJob();

// Start Telegram bot
startTelegramBot();

console.log('✅ All services started');
