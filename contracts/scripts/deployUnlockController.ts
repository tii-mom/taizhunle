import { Address, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { TAIUnlockController } from '../build/TAIUnlockController/TAIUnlockController_TAIUnlockController';

export async function run(provider: NetworkProvider) {
  const adminAddress = provider.sender().address ?? Address.parse('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c');
  const treasuryAddress = Address.parse(process.env.UNLOCK_TREASURY ?? adminAddress.toString());
  
  // Sale end timestamp: 30 days from now
  const saleEndTimestamp = BigInt(Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60);
  
  // USDC Master address (placeholder, should be set in .env)
  const usdcMasterAddress = Address.parse(process.env.USDC_MASTER_ADDRESS ?? adminAddress.toString());

  const controller = provider.open(
    await TAIUnlockController.fromInit(adminAddress, treasuryAddress, saleEndTimestamp, usdcMasterAddress)
  );

  await controller.send(provider.sender(), { value: toNano('0.2') }, null);
  await provider.waitForDeploy(controller.address);

  console.log('=== TAIUnlockController Deployment ===');
  console.log('Contract Address:', controller.address.toString());
  console.log('Admin Address:', adminAddress.toString());
  console.log('Treasury Address:', treasuryAddress.toString());
  console.log('Sale End Timestamp:', saleEndTimestamp.toString());
  console.log('USDC Master Address:', usdcMasterAddress.toString());
  console.log('=====================================');
}
