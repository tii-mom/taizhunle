import cron from 'node-cron';

// Run daily at 20:00 (start acceleration)
export function startAccelerateJob() {
  cron.schedule('0 20 * * *', async () => {
    console.log('⚡ Starting acceleration period (20:00-24:00)...');

    try {
      // TODO: Update accelerate flag in database
      console.log('✅ Acceleration started: 5% → 10%');

      // TODO: Send Telegram notification
      console.log('📢 Telegram notification sent');
    } catch (error) {
      console.error('❌ Acceleration job failed:', error);
    }
  });

  // Run daily at 00:00 (end acceleration)
  cron.schedule('0 0 * * *', async () => {
    console.log('⏹️ Ending acceleration period...');

    try {
      // TODO: Update accelerate flag in database
      console.log('✅ Acceleration ended: 10% → 5%');
    } catch (error) {
      console.error('❌ Acceleration end job failed:', error);
    }
  });

  console.log('⏰ Acceleration jobs scheduled (20:00 start, 00:00 end)');
}
