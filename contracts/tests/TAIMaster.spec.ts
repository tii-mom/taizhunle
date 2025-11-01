import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { TAIMaster } from '../build/TAIMaster/TAIMaster_TAIMaster';
import '@ton/test-utils';

describe('TAIMaster', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let tAIMaster: SandboxContract<TAIMaster>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        tAIMaster = blockchain.openContract(await TAIMaster.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await tAIMaster.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            null,
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: tAIMaster.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and tAIMaster are ready to use
    });
});
