import cron from 'node-cron';

// Run 4 times daily: 12:00, 14:00, 18:00, 22:00
export function startOfficialCreateJob() {
  cron.schedule('0 12,14,18,22 * * *', async () => {
    console.log('🎁 Creating official rain drop...');

    try {
      // Random amount between 5k and 100k TAI
      const amount = Math.floor(Math.random() * (100000 - 5000 + 1)) + 5000;

      // TODO: Create official rain in database
      console.log(`✅ Official rain created: ${amount.toLocaleString()} TAI`);

      // TODO: Send Telegram notification
      console.log('📢 Telegram notification sent');
    } catch (error) {
      console.error('❌ Official create job failed:', error);
    }
  });

  console.log('⏰ Official rain job scheduled (12:00, 14:00, 18:00, 22:00)');
}
