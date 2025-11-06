import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, Cell, beginCell, toNano } from '@ton/core';
import { JurorStaking } from '../build/JurorStaking/JurorStaking_JurorStaking';

function buildEntries(entries: Array<{ address: Address; amount: bigint }>): Cell | null {
    if (entries.length === 0) {
        return null;
    }
    let cell: Cell | null = null;
    for (let i = entries.length - 1; i >= 0; i -= 1) {
        const entry = entries[i];
        const builder = beginCell();
        builder.storeAddress(entry.address);
        builder.storeInt(entry.amount, 257);
        builder.storeMaybeRef(cell);
        cell = builder.endCell();
    }
    return cell;
}

describe('JurorStaking', () => {
    let blockchain: Blockchain;
    let admin: SandboxContract<TreasuryContract>;
    let prediction: SandboxContract<TreasuryContract>;
    let treasury: SandboxContract<TreasuryContract>;
    let staker: SandboxContract<TreasuryContract>;
    let staking: SandboxContract<JurorStaking>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        admin = await blockchain.treasury('admin');
        prediction = await blockchain.treasury('prediction');
        treasury = await blockchain.treasury('treasury');
        staker = await blockchain.treasury('staker');

        staking = blockchain.openContract(
            await JurorStaking.fromInit(admin.address, prediction.address, treasury.address),
        );

        await staking.send(admin.getSender(), { value: toNano('1') }, null);
    });

    it('allows staking and computes whitelist quota', async () => {
        await staking.send(staker.getSender(), { value: toNano('0.1') }, {
            $$type: 'Stake',
            amount: BigInt(20_000),
        });

        const quota = await staking.getWhitelistQuotaOf(staker.address);
        expect(quota).toBeGreaterThanOrEqual(BigInt(0));

        const info = await staking.getStakeOf(staker.address);
        expect(info!!.amount).toEqual(BigInt(20_000));
    });
});
