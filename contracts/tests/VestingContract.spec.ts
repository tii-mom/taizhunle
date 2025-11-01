import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { VestingContract } from '../build/VestingContract/VestingContract_VestingContract';
import '@ton/test-utils';

describe('VestingContract', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let vestingContract: SandboxContract<VestingContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        vestingContract = blockchain.openContract(await VestingContract.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await vestingContract.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            null,
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: vestingContract.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and vestingContract are ready to use
    });
});
