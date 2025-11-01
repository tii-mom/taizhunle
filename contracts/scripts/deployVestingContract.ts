import { toNano } from '@ton/core';
import { VestingContract } from '../build/VestingContract/VestingContract_VestingContract';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const vestingContract = provider.open(await VestingContract.fromInit());

    await vestingContract.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        null,
    );

    await provider.waitForDeploy(vestingContract.address);

    // run methods on `vestingContract`
}
