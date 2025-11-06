import { Address, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { PredictionMarket } from '../build/PredictionMarket/PredictionMarket_PredictionMarket';

export async function run(provider: NetworkProvider) {
  const admin = provider.sender().address ?? Address.parse('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c');
  const treasury = Address.parse(process.env.PREDICTION_MARKET_TREASURY ?? admin.toString());
  const staking = Address.parse(process.env.JUROR_STAKING_CONTRACT ?? admin.toString());

  const prediction = provider.open(await PredictionMarket.fromInit(admin, treasury, staking));

  await prediction.send(provider.sender(), { value: toNano('0.2') }, null);
  await provider.waitForDeploy(prediction.address);

  console.log('PredictionMarket deployed at', prediction.address.toString());
}
