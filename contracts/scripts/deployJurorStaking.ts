import { Address, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { JurorStaking } from '../build/JurorStaking/JurorStaking_JurorStaking';

export async function run(provider: NetworkProvider) {
  const adminAddress = provider.sender().address ?? Address.parse('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c');
  const predictionAddress = Address.parse(process.env.PREDICTION_MARKET_CONTRACT ?? adminAddress.toString());
  const treasuryAddress = Address.parse(process.env.JUROR_STAKING_TREASURY ?? adminAddress.toString());

  const staking = provider.open(await JurorStaking.fromInit(adminAddress, predictionAddress, treasuryAddress));

  await staking.send(provider.sender(), { value: toNano('0.2') }, null);
  await provider.waitForDeploy(staking.address);

  console.log('JurorStaking deployed at', staking.address.toString());
}
