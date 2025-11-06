import { Address, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { TaiOracle } from '../build/TaiOracle/TaiOracle_TaiOracle';

export async function run(provider: NetworkProvider) {
  const adminAddress = provider.sender().address ?? Address.parse('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c');

  const oracle = provider.open(await TaiOracle.fromInit(adminAddress));
  await oracle.send(provider.sender(), { value: toNano('0.2') }, null);
  await provider.waitForDeploy(oracle.address);

  console.log('TaiOracle deployed at', oracle.address.toString());
}
