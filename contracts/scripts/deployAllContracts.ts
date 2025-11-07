import * as dotenv from 'dotenv';
import { Address, toNano, TonClient } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { TAIUnlockController } from '../build/TAIUnlockController/TAIUnlockController_TAIUnlockController';
import { JurorStaking } from '../build/JurorStaking/JurorStaking_JurorStaking';
import { PredictionMarket } from '../build/PredictionMarket/PredictionMarket_PredictionMarket';
import { TaiOracle } from '../build/TaiOracle/TaiOracle_TaiOracle';
import { WalletContractV4 } from '@ton/ton';

dotenv.config();

async function deploy() {
  const mnemonic = process.env.TON_DEPLOY_MNEMONIC;
  if (!mnemonic) {
    throw new Error('TON_DEPLOY_MNEMONIC not found in .env');
  }

  const network = process.env.TON_NETWORK || 'testnet';
  const endpoint = network === 'mainnet' 
    ? 'https://toncenter.com/api/v2/jsonRPC'
    : 'https://testnet.toncenter.com/api/v2/jsonRPC';

  console.log(`\n🚀 Starting deployment on ${network}...\n`);

  // Initialize client
  const client = new TonClient({ endpoint });

  // Get wallet from mnemonic
  const keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));
  const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
  const walletContract = client.open(wallet);
  const walletAddress = wallet.address;

  console.log('📍 Deployer Address:', walletAddress.toString());

  // Check balance
  const balance = await client.getBalance(walletAddress);
  console.log('💰 Balance:', (Number(balance) / 1e9).toFixed(4), 'TON\n');

  if (Number(balance) < 1e9) {
    throw new Error('Insufficient balance. Need at least 1 TON for deployment.');
  }

  const deploymentResults: any = {};

  // 1. Deploy TAIUnlockController
  console.log('📝 Deploying TAIUnlockController...');
  const treasuryAddress = walletAddress; // Use deployer as treasury for now
  const saleEndTimestamp = BigInt(Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60);
  const usdcMasterAddress = walletAddress; // Placeholder

  const unlockController = await TAIUnlockController.fromInit(
    walletAddress,
    treasuryAddress,
    saleEndTimestamp,
    usdcMasterAddress
  );

  deploymentResults.unlockController = {
    address: unlockController.address.toString(),
    adminAddress: walletAddress.toString(),
    treasuryAddress: treasuryAddress.toString(),
    saleEndTimestamp: saleEndTimestamp.toString(),
    usdcMasterAddress: usdcMasterAddress.toString(),
  };

  console.log('✅ TAIUnlockController Address:', unlockController.address.toString());
  console.log('   Admin:', walletAddress.toString());
  console.log('   Treasury:', treasuryAddress.toString());
  console.log('   Sale End:', new Date(Number(saleEndTimestamp) * 1000).toISOString());
  console.log();

  // 2. Deploy JurorStaking
  console.log('📝 Deploying JurorStaking...');
  const predictionAddress = walletAddress; // Will be updated after PredictionMarket deployment
  const stakingTreasury = walletAddress;

  const jurorStaking = await JurorStaking.fromInit(
    walletAddress,
    predictionAddress,
    stakingTreasury
  );

  deploymentResults.jurorStaking = {
    address: jurorStaking.address.toString(),
    adminAddress: walletAddress.toString(),
    predictionMarketAddress: predictionAddress.toString(),
    treasuryAddress: stakingTreasury.toString(),
  };

  console.log('✅ JurorStaking Address:', jurorStaking.address.toString());
  console.log('   Admin:', walletAddress.toString());
  console.log('   Treasury:', stakingTreasury.toString());
  console.log();

  // 3. Deploy PredictionMarket
  console.log('📝 Deploying PredictionMarket...');
  const marketTreasury = walletAddress;

  const predictionMarket = await PredictionMarket.fromInit(
    walletAddress,
    marketTreasury,
    jurorStaking.address
  );

  deploymentResults.predictionMarket = {
    address: predictionMarket.address.toString(),
    adminAddress: walletAddress.toString(),
    treasuryAddress: marketTreasury.toString(),
    stakingAddress: jurorStaking.address.toString(),
  };

  console.log('✅ PredictionMarket Address:', predictionMarket.address.toString());
  console.log('   Admin:', walletAddress.toString());
  console.log('   Treasury:', marketTreasury.toString());
  console.log('   Staking:', jurorStaking.address.toString());
  console.log();

  // 4. Deploy TaiOracle
  console.log('📝 Deploying TaiOracle...');
  const taiOracle = await TaiOracle.fromInit(walletAddress);

  deploymentResults.taiOracle = {
    address: taiOracle.address.toString(),
    adminAddress: walletAddress.toString(),
  };

  console.log('✅ TaiOracle Address:', taiOracle.address.toString());
  console.log('   Admin:', walletAddress.toString());
  console.log();

  // Print summary
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📋 DEPLOYMENT SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log();
  console.log('TAIUnlockController:', deploymentResults.unlockController.address);
  console.log('JurorStaking:', deploymentResults.jurorStaking.address);
  console.log('PredictionMarket:', deploymentResults.predictionMarket.address);
  console.log('TaiOracle:', deploymentResults.taiOracle.address);
  console.log();
  console.log('═══════════════════════════════════════════════════════════');
  console.log();

  // Save to JSON
  const fs = require('fs');
  const path = require('path');
  const outputPath = path.join(__dirname, '../../deployment-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(deploymentResults, null, 2));
  console.log('💾 Results saved to:', outputPath);
  console.log();

  return deploymentResults;
}

deploy().catch(console.error);
