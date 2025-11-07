import * as dotenv from 'dotenv';
import { Address, toNano, TonClient, WalletContractV4, internal, beginCell } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { TAIUnlockController } from '../build/TAIUnlockController/TAIUnlockController_TAIUnlockController';
import { JurorStaking } from '../build/JurorStaking/JurorStaking_JurorStaking';
import { PredictionMarket } from '../build/PredictionMarket/PredictionMarket_PredictionMarket';
import { TaiOracle } from '../build/TaiOracle/TaiOracle_TaiOracle';

dotenv.config();

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForDeploy(client: TonClient, address: Address, maxAttempts = 30) {
  console.log('   ⏳ Waiting for deployment...');
  for (let i = 0; i < maxAttempts; i++) {
    await sleep(3000); // Increased delay to avoid rate limits
    try {
      const state = await client.getContractState(address);
      if (state.state === 'active') {
        console.log('   ✅ Contract deployed successfully!');
        return true;
      }
    } catch (e: any) {
      if (e.status === 429) {
        console.log('\n   ⚠️  Rate limit hit, waiting longer...');
        await sleep(5000);
      }
      // Continue waiting
    }
    process.stdout.write('.');
  }
  console.log('\n   ⚠️  Deployment timeout, but transaction may still be processing');
  return false;
}

async function deploy() {
  const mnemonic = process.env.TON_DEPLOY_MNEMONIC;
  if (!mnemonic) {
    throw new Error('TON_DEPLOY_MNEMONIC not found in .env');
  }

  const network = process.env.TON_NETWORK || 'testnet';
  const apiKey = process.env.TONCENTER_API_KEY;
  
  let endpoint = network === 'mainnet' 
    ? 'https://toncenter.com/api/v2/jsonRPC'
    : 'https://testnet.toncenter.com/api/v2/jsonRPC';
  
  if (apiKey) {
    endpoint += `?api_key=${apiKey}`;
  }

  console.log(`\n🚀 Starting actual deployment on ${network}...\n`);
  if (apiKey) {
    console.log('✅ Using Toncenter API key\n');
  } else {
    console.log('⚠️  No API key found, using public endpoint (rate limited)\n');
  }

  const client = new TonClient({ endpoint });
  const keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));
  const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
  const walletContract = client.open(wallet);
  const walletAddress = wallet.address;

  console.log('📍 Deployer Address:', walletAddress.toString());

  const balance = await client.getBalance(walletAddress);
  console.log('💰 Balance:', (Number(balance) / 1e9).toFixed(4), 'TON\n');

  if (Number(balance) < 1e9) {
    throw new Error('Insufficient balance. Need at least 1 TON for deployment.');
  }

  const deploymentResults: any = {
    network,
    deployerAddress: walletAddress.toString(),
    timestamp: new Date().toISOString(),
    contracts: {}
  };

  // 1. Deploy TAIUnlockController
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📝 1/4 Deploying TAIUnlockController...');
  console.log('═══════════════════════════════════════════════════════════');
  
  const treasuryAddress = walletAddress;
  const saleEndTimestamp = BigInt(Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60);
  const usdcMasterAddress = walletAddress;

  const unlockController = await TAIUnlockController.fromInit(
    walletAddress,
    treasuryAddress,
    saleEndTimestamp,
    usdcMasterAddress
  );

  const unlockContract = client.open(unlockController);
  
  await walletContract.sendTransfer({
    seqno: await walletContract.getSeqno(),
    secretKey: keyPair.secretKey,
    messages: [internal({
      to: unlockController.address,
      value: toNano('0.5'),
      init: unlockController.init,
      body: beginCell().endCell(),
    })]
  });

  await waitForDeploy(client, unlockController.address);

  deploymentResults.contracts.unlockController = {
    address: unlockController.address.toString(),
    adminAddress: walletAddress.toString(),
    treasuryAddress: treasuryAddress.toString(),
    saleEndTimestamp: saleEndTimestamp.toString(),
    saleEndDate: new Date(Number(saleEndTimestamp) * 1000).toISOString(),
    usdcMasterAddress: usdcMasterAddress.toString(),
  };

  console.log('✅ TAIUnlockController:', unlockController.address.toString());
  console.log();

  await sleep(5000); // Longer delay between deployments

  // 2. Deploy JurorStaking
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📝 2/4 Deploying JurorStaking...');
  console.log('═══════════════════════════════════════════════════════════');
  
  const predictionPlaceholder = walletAddress;
  const stakingTreasury = walletAddress;

  const jurorStaking = await JurorStaking.fromInit(
    walletAddress,
    predictionPlaceholder,
    stakingTreasury
  );

  const stakingContract = client.open(jurorStaking);

  await walletContract.sendTransfer({
    seqno: await walletContract.getSeqno(),
    secretKey: keyPair.secretKey,
    messages: [internal({
      to: jurorStaking.address,
      value: toNano('0.5'),
      init: jurorStaking.init,
      body: beginCell().endCell(),
    })]
  });

  await waitForDeploy(client, jurorStaking.address);

  deploymentResults.contracts.jurorStaking = {
    address: jurorStaking.address.toString(),
    adminAddress: walletAddress.toString(),
    predictionMarketAddress: predictionPlaceholder.toString(),
    treasuryAddress: stakingTreasury.toString(),
  };

  console.log('✅ JurorStaking:', jurorStaking.address.toString());
  console.log();

  await sleep(5000); // Longer delay between deployments

  // 3. Deploy PredictionMarket
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📝 3/4 Deploying PredictionMarket...');
  console.log('═══════════════════════════════════════════════════════════');
  
  const marketTreasury = walletAddress;

  const predictionMarket = await PredictionMarket.fromInit(
    walletAddress,
    marketTreasury,
    jurorStaking.address
  );

  const marketContract = client.open(predictionMarket);

  await walletContract.sendTransfer({
    seqno: await walletContract.getSeqno(),
    secretKey: keyPair.secretKey,
    messages: [internal({
      to: predictionMarket.address,
      value: toNano('0.5'),
      init: predictionMarket.init,
      body: beginCell().endCell(),
    })]
  });

  await waitForDeploy(client, predictionMarket.address);

  deploymentResults.contracts.predictionMarket = {
    address: predictionMarket.address.toString(),
    adminAddress: walletAddress.toString(),
    treasuryAddress: marketTreasury.toString(),
    stakingAddress: jurorStaking.address.toString(),
  };

  console.log('✅ PredictionMarket:', predictionMarket.address.toString());
  console.log();

  await sleep(5000); // Longer delay between deployments

  // 4. Deploy TaiOracle
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📝 4/4 Deploying TaiOracle...');
  console.log('═══════════════════════════════════════════════════════════');
  
  const taiOracle = await TaiOracle.fromInit(walletAddress);

  const oracleContract = client.open(taiOracle);

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

  await waitForDeploy(client, taiOracle.address);

  deploymentResults.contracts.taiOracle = {
    address: taiOracle.address.toString(),
    adminAddress: walletAddress.toString(),
  };

  console.log('✅ TaiOracle:', taiOracle.address.toString());
  console.log();

  // Print final summary
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                   DEPLOYMENT COMPLETE                     ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log();
  console.log('Network:', network);
  console.log('Deployer:', walletAddress.toString());
  console.log();
  console.log('Contract Addresses:');
  console.log('─────────────────────────────────────────────────────────────');
  console.log('TAIUnlockController:', deploymentResults.contracts.unlockController.address);
  console.log('JurorStaking:       ', deploymentResults.contracts.jurorStaking.address);
  console.log('PredictionMarket:   ', deploymentResults.contracts.predictionMarket.address);
  console.log('TaiOracle:          ', deploymentResults.contracts.taiOracle.address);
  console.log('─────────────────────────────────────────────────────────────');
  console.log();

  // Save to JSON
  const fs = require('fs');
  const path = require('path');
  const outputPath = path.join(__dirname, '../../deployment-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(deploymentResults, null, 2));
  console.log('💾 Full results saved to: deployment-results.json');
  console.log();

  // Print explorer links
  const explorerBase = network === 'mainnet' 
    ? 'https://tonscan.org/address/'
    : 'https://testnet.tonscan.org/address/';
  
  console.log('🔍 View on Explorer:');
  console.log('─────────────────────────────────────────────────────────────');
  console.log('TAIUnlockController:', explorerBase + deploymentResults.contracts.unlockController.address);
  console.log('JurorStaking:       ', explorerBase + deploymentResults.contracts.jurorStaking.address);
  console.log('PredictionMarket:   ', explorerBase + deploymentResults.contracts.predictionMarket.address);
  console.log('TaiOracle:          ', explorerBase + deploymentResults.contracts.taiOracle.address);
  console.log('─────────────────────────────────────────────────────────────');
  console.log();

  return deploymentResults;
}

deploy().catch(console.error);
