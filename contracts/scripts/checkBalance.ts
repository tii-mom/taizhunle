import * as dotenv from 'dotenv';
import { TonClient, WalletContractV4 } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';

dotenv.config();

async function check() {
  const mnemonic = process.env.TON_DEPLOY_MNEMONIC;
  const apiKey = process.env.TONCENTER_API_KEY;
  const endpoint = `https://testnet.toncenter.com/api/v2/jsonRPC?api_key=${apiKey}`;
  
  const client = new TonClient({ endpoint });
  const keyPair = await mnemonicToPrivateKey(mnemonic!.split(' '));
  const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
  
  const balance = await client.getBalance(wallet.address);
  const seqno = await client.open(wallet).getSeqno();
  
  console.log('Wallet:', wallet.address.toString());
  console.log('Balance:', (Number(balance) / 1e9).toFixed(4), 'TON');
  console.log('Seqno:', seqno);
}

check().catch(console.error);
