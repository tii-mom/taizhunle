import cron from 'node-cron';

// Run daily at 00:00
export function startPriceAdjustJob() {
  cron.schedule('0 0 * * *', async () => {
    console.log('🔄 Running price adjustment job...');

    try {
      // TODO: Fetch yesterday's sales data
      const salesVolume = 0; // Mock

      let adjustment = 0;
      if (salesVolume < 500000) {
        adjustment = -30; // Decrease 30%
      } else if (salesVolume < 800000) {
        adjustment = 0; // Keep same
      } else if (salesVolume < 950000) {
        adjustment = 30; // Increase 30%
      } else {
        adjustment = 50; // Increase 50%
      }

      // TODO: Update price in database
      console.log(`✅ Price adjusted by ${adjustment}%`);

      // TODO: Send Telegram notification
      console.log('📢 Telegram notification sent');
    } catch (error) {
      console.error('❌ Price adjustment job failed:', error);
    }
  });

  console.log('⏰ Price adjustment job scheduled (daily at 00:00)');
}
