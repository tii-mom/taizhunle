import * as dotenv from 'dotenv';
import { TonClient, Address } from '@ton/ton';

dotenv.config();

async function query() {
  const apiKey = process.env.TONCENTER_API_KEY;
  const endpoint = `https://testnet.toncenter.com/api/v2/jsonRPC?api_key=${apiKey}`;
  const client = new TonClient({ endpoint });

  const contracts = [
    { name: 'TAIUnlockController', address: 'EQB9NffSKbslsvIY7Wi5pQL15KuWlgVAqqai_0W3Q1cZp9HW' },
    { name: 'JurorStaking', address: 'EQC4SVjr97GTvW7l8AWTDXwCRAx5dcP9tAJjNmGcsv05L7ih' },
    { name: 'PredictionMarket', address: 'EQCz_WsJ-14P_-URq0AT-HfGAWAyBt_WnLcor6s7tDTeq9lJ' },
    { name: 'TaiOracle', address: 'EQAt6joNLn0QZEAM0IpaQLWWvbtLDXCrTAMyR1RrwbL3qelJ' }
  ];

  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║              DEPLOYMENT TRANSACTION DETAILS               ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  for (const contract of contracts) {
    console.log(`\n${contract.name}:`);
    console.log('─────────────────────────────────────────────────────────────');
    console.log('Address:', contract.address);
    
    try {
      const addr = Address.parse(contract.address);
      const transactions = await client.getTransactions(addr, { limit: 1 });
      
      if (transactions.length > 0) {
        const tx = transactions[0];
        console.log('Transaction Hash:', tx.hash().toString('hex'));
        console.log('Block:', tx.lt);
        console.log('Timestamp:', new Date(tx.now * 1000).toISOString());
        
        // Calculate fees
        const inMsg = tx.inMessage;
        if (inMsg && inMsg.info.type === 'internal') {
          const value = inMsg.info.value.coins;
          console.log('Deployment Value:', (Number(value) / 1e9).toFixed(4), 'TON');
        }
        
        const totalFees = tx.totalFees.coins;
        console.log('Transaction Fees:', (Number(totalFees) / 1e9).toFixed(6), 'TON');
      }
      
      const balance = await client.getBalance(addr);
      console.log('Current Balance:', (Number(balance) / 1e9).toFixed(4), 'TON');
      
    } catch (e: any) {
      console.log('Error:', e.message);
    }
  }
  
  console.log('\n');
}

query().catch(console.error);
