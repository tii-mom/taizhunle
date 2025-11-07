import * as dotenv from 'dotenv';
import { Address, toNano, TonClient, WalletContractV4, internal, beginCell } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { TaiOracle } from '../build/TaiOracle/TaiOracle_TaiOracle';

dotenv.config();

async function deploy() {
  const mnemonic = process.env.TON_DEPLOY_MNEMONIC;
  const apiKey = process.env.TONCENTER_API_KEY;
  const endpoint = `https://testnet.toncenter.com/api/v2/jsonRPC?api_key=${apiKey}`;
  
  const client = new TonClient({ endpoint });
  const keyPair = await mnemonicToPrivateKey(mnemonic!.split(' '));
  const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
  const walletContract = client.open(wallet);
  const walletAddress = wallet.address;

  console.log('🚀 Deploying TaiOracle (Retry)...');
  console.log('Deployer:', walletAddress.toString());
  
  const taiOracle = await TaiOracle.fromInit(walletAddress);
  console.log('Target Address:', taiOracle.address.toString());
  
  const seqno = await walletContract.getSeqno();
  console.log('Current Seqno:', seqno);
  
  await walletContract.sendTransfer({
    seqno,
    secretKey: keyPair.secretKey,
    messages: [internal({
      to: taiOracle.address,
      value: toNano('0.05'),
      init: taiOracle.init,
      body: beginCell().endCell(),
    })]
  });

  console.log('✅ Transaction sent!');
  console.log('⏳ Waiting for confirmation...');
  
  // Wait for seqno to increment
  for (let i = 0; i < 30; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
      const newSeqno = await walletContract.getSeqno();
      if (newSeqno > seqno) {
        console.log('✅ Transaction confirmed! New Seqno:', newSeqno);
        break;
      }
    } catch (e) {}
    process.stdout.write('.');
  }
  
  console.log('\n⏳ Checking deployment...');
  
  for (let i = 0; i < 20; i++) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    try {
      const balance = await client.getBalance(taiOracle.address);
      if (Number(balance) > 0) {
        console.log('✅ TaiOracle deployed successfully!');
        console.log('Balance:', (Number(balance) / 1e9).toFixed(4), 'TON');
        
        const transactions = await client.getTransactions(taiOracle.address, { limit: 1 });
        if (transactions.length > 0) {
          const tx = transactions[0];
          console.log('Transaction Hash:', tx.hash().toString('hex'));
          console.log('Block LT:', tx.lt.toString());
          console.log('Timestamp:', new Date(tx.now * 1000).toISOString());
          console.log('Fees:', (Number(tx.totalFees.coins) / 1e9).toFixed(6), 'TON');
        }
        return;
      }
    } catch (e) {}
    process.stdout.write('.');
  }
  
  console.log('\n⚠️  Timeout, checking final status...');
  const balance = await client.getBalance(taiOracle.address);
  console.log('Final Balance:', (Number(balance) / 1e9).toFixed(4), 'TON');
}

deploy().catch(console.error);
