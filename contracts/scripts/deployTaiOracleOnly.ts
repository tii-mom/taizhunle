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

  console.log('Deploying TaiOracle...');
  console.log('Deployer:', walletAddress.toString());
  
  const taiOracle = await TaiOracle.fromInit(walletAddress);
  
  await walletContract.sendTransfer({
    seqno: await walletContract.getSeqno(),
    secretKey: keyPair.secretKey,
    messages: [internal({
      to: taiOracle.address,
      value: toNano('0.5'),
      init: taiOracle.init,
      body: beginCell().endCell(),
    })]
  });

  console.log('Transaction sent!');
  console.log('TaiOracle Address:', taiOracle.address.toString());
  
  // Wait for deployment
  for (let i = 0; i < 30; i++) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    try {
      const state = await client.getContractState(taiOracle.address);
      if (state.state === 'active') {
        console.log('✅ Deployed successfully!');
        
        const transactions = await client.getTransactions(taiOracle.address, { limit: 1 });
        if (transactions.length > 0) {
          const tx = transactions[0];
          console.log('Transaction Hash:', tx.hash().toString('hex'));
          console.log('Block:', tx.lt.toString());
        }
        return;
      }
    } catch (e) {}
  }
  
  console.log('Timeout, but may still be processing...');
}

deploy().catch(console.error);
