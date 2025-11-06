import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { TaiOracle } from '../build/TaiOracle/TaiOracle_TaiOracle';

describe('TaiOracle', () => {
    let blockchain: Blockchain;
    let admin: SandboxContract<TreasuryContract>;
    let oracle: SandboxContract<TaiOracle>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        admin = await blockchain.treasury('admin');
        oracle = blockchain.openContract(await TaiOracle.fromInit(admin.address));
        await oracle.send(admin.getSender(), { value: toNano('0.5') }, null);
    });

    it('stores prices and computes averages with outlier filter', async () => {
        const nowTs = BigInt(Math.floor(Date.now() / 1000));
        await oracle.send(admin.getSender(), { value: toNano('0.05') }, {
            $$type: 'PushPrice',
            timestamp: nowTs,
            price: BigInt(100_000_000),
        });

        await oracle.send(admin.getSender(), { value: toNano('0.05') }, {
            $$type: 'PushPrice',
            timestamp: nowTs + BigInt(86_400),
            price: BigInt(105_000_000),
        });

        await oracle.send(admin.getSender(), { value: toNano('0.05') }, {
            $$type: 'PushPrice',
            timestamp: nowTs + BigInt(2 * 86_400),
            price: BigInt(500_000_000), // outlier
        });

        await oracle.send(admin.getSender(), { value: toNano('0.05') }, {
            $$type: 'PushPrice',
            timestamp: nowTs + BigInt(3 * 86_400),
            price: BigInt(110_000_000),
        });

        const avg = await oracle.getAverage(BigInt(3));
        expect(avg).toBeGreaterThan(BigInt(100_000_000));
        expect(avg).toBeLessThan(BigInt(200_000_000));
    });
});
