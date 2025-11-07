import * as dotenv from 'dotenv';
import { Address } from '@ton/core';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { TAIUnlockController } from '../build/TAIUnlockController/TAIUnlockController_TAIUnlockController';
import { JurorStaking } from '../build/JurorStaking/JurorStaking_JurorStaking';
import { PredictionMarket } from '../build/PredictionMarket/PredictionMarket_PredictionMarket';
import { TaiOracle } from '../build/TaiOracle/TaiOracle_TaiOracle';
import { WalletContractV4 } from '@ton/ton';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

async function generate() {
  const mnemonic = process.env.TON_DEPLOY_MNEMONIC;
  if (!mnemonic) {
    throw new Error('TON_DEPLOY_MNEMONIC not found in .env');
  }

  const network = process.env.TON_NETWORK || 'testnet';

  console.log(`\n╔═══════════════════════════════════════════════════════════╗`);
  console.log(`║          TON Contract Deployment Information             ║`);
  console.log(`╚═══════════════════════════════════════════════════════════╝\n`);

  // Get wallet from mnemonic
  const keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));
  const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
  const walletAddress = wallet.address;

  console.log('Network:', network);
  console.log('Deployer Address:', walletAddress.toString());
  console.log();

  const deploymentResults: any = {
    network,
    deployerAddress: walletAddress.toString(),
    timestamp: new Date().toISOString(),
    contracts: {}
  };

  // 1. TAIUnlockController
  console.log('═══════════════════════════════════════════════════════════');
  console.log('1. TAIUnlockController');
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

  deploymentResults.contracts.unlockController = {
    name: 'TAIUnlockController',
    address: unlockController.address.toString(),
    adminAddress: walletAddress.toString(),
    treasuryAddress: treasuryAddress.toString(),
    saleEndTimestamp: saleEndTimestamp.toString(),
    saleEndDate: new Date(Number(saleEndTimestamp) * 1000).toISOString(),
    usdcMasterAddress: usdcMasterAddress.toString(),
  };

  console.log('Contract Address:', unlockController.address.toString());
  console.log('Admin:', walletAddress.toString());
  console.log('Treasury:', treasuryAddress.toString());
  console.log('Sale End:', new Date(Number(saleEndTimestamp) * 1000).toISOString());
  console.log('USDC Master:', usdcMasterAddress.toString());
  console.log();

  // 2. JurorStaking
  console.log('═══════════════════════════════════════════════════════════');
  console.log('2. JurorStaking');
  console.log('═══════════════════════════════════════════════════════════');
  
  const predictionPlaceholder = walletAddress;
  const stakingTreasury = walletAddress;

  const jurorStaking = await JurorStaking.fromInit(
    walletAddress,
    predictionPlaceholder,
    stakingTreasury
  );

  deploymentResults.contracts.jurorStaking = {
    name: 'JurorStaking',
    address: jurorStaking.address.toString(),
    adminAddress: walletAddress.toString(),
    predictionMarketAddress: predictionPlaceholder.toString(),
    treasuryAddress: stakingTreasury.toString(),
  };

  console.log('Contract Address:', jurorStaking.address.toString());
  console.log('Admin:', walletAddress.toString());
  console.log('Prediction Market (placeholder):', predictionPlaceholder.toString());
  console.log('Treasury:', stakingTreasury.toString());
  console.log();

  // 3. PredictionMarket
  console.log('═══════════════════════════════════════════════════════════');
  console.log('3. PredictionMarket');
  console.log('═══════════════════════════════════════════════════════════');
  
  const marketTreasury = walletAddress;

  const predictionMarket = await PredictionMarket.fromInit(
    walletAddress,
    marketTreasury,
    jurorStaking.address
  );

  deploymentResults.contracts.predictionMarket = {
    name: 'PredictionMarket',
    address: predictionMarket.address.toString(),
    adminAddress: walletAddress.toString(),
    treasuryAddress: marketTreasury.toString(),
    stakingAddress: jurorStaking.address.toString(),
  };

  console.log('Contract Address:', predictionMarket.address.toString());
  console.log('Admin:', walletAddress.toString());
  console.log('Treasury:', marketTreasury.toString());
  console.log('Staking Contract:', jurorStaking.address.toString());
  console.log();

  // 4. TaiOracle
  console.log('═══════════════════════════════════════════════════════════');
  console.log('4. TaiOracle');
  console.log('═══════════════════════════════════════════════════════════');
  
  const taiOracle = await TaiOracle.fromInit(walletAddress);

  deploymentResults.contracts.taiOracle = {
    name: 'TaiOracle',
    address: taiOracle.address.toString(),
    adminAddress: walletAddress.toString(),
  };

  console.log('Contract Address:', taiOracle.address.toString());
  console.log('Admin:', walletAddress.toString());
  console.log();

  // Summary
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                    DEPLOYMENT SUMMARY                     ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
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
  const outputPath = path.join(__dirname, '../../deployment-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(deploymentResults, null, 2));
  console.log('💾 Results saved to: deployment-results.json');
  console.log();

  // Print explorer links
  const explorerBase = network === 'mainnet' 
    ? 'https://tonscan.org/address/'
    : 'https://testnet.tonscan.org/address/';
  
  console.log('🔍 Explorer Links (after deployment):');
  console.log('─────────────────────────────────────────────────────────────');
  console.log('TAIUnlockController:', explorerBase + deploymentResults.contracts.unlockController.address);
  console.log('JurorStaking:       ', explorerBase + deploymentResults.contracts.jurorStaking.address);
  console.log('PredictionMarket:   ', explorerBase + deploymentResults.contracts.predictionMarket.address);
  console.log('TaiOracle:          ', explorerBase + deploymentResults.contracts.taiOracle.address);
  console.log('─────────────────────────────────────────────────────────────');
  console.log();

  console.log('📝 Next Steps:');
  console.log('─────────────────────────────────────────────────────────────');
  console.log('1. Get a Toncenter API key from: https://testnet.toncenter.com');
  console.log('2. Add it to .env: TONCENTER_API_KEY=your_key_here');
  console.log('3. Run: npx tsx scripts/actualDeploy.ts');
  console.log('   OR use TON wallet to deploy manually with the addresses above');
  console.log('─────────────────────────────────────────────────────────────');
  console.log();

  return deploymentResults;
}

generate().catch(console.error);
