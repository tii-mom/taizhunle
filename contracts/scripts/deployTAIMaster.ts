import { toNano } from '@ton/core';
import { TAIMaster } from '../build/TAIMaster/TAIMaster_TAIMaster';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const tAIMaster = provider.open(await TAIMaster.fromInit());

    await tAIMaster.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        null,
    );

    await provider.waitForDeploy(tAIMaster.address);

    // run methods on `tAIMaster`
}
