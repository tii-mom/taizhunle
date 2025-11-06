import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, Cell, beginCell, toNano } from '@ton/core';
import { PredictionMarket } from '../build/PredictionMarket/PredictionMarket_PredictionMarket';
import { JurorStaking } from '../build/JurorStaking/JurorStaking_JurorStaking';

function buildLinkedList(entries: Array<{ address: Address; amount: bigint }>): Cell | null {
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

describe('PredictionMarket', () => {
    let blockchain: Blockchain;
    let admin: SandboxContract<TreasuryContract>;
    let treasury: SandboxContract<TreasuryContract>;
    let stakingOwner: SandboxContract<TreasuryContract>;
    let stakingTreasury: SandboxContract<TreasuryContract>;
    let bettorYes: SandboxContract<TreasuryContract>;
    let bettorNo: SandboxContract<TreasuryContract>;
    let juror: SandboxContract<TreasuryContract>;
    let prediction: SandboxContract<PredictionMarket>;
    let staking: SandboxContract<JurorStaking>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        admin = await blockchain.treasury('admin');
        treasury = await blockchain.treasury('treasury');
        stakingOwner = await blockchain.treasury('staking_owner');
        stakingTreasury = await blockchain.treasury('staking_treasury');
        bettorYes = await blockchain.treasury('bettor_yes');
        bettorNo = await blockchain.treasury('bettor_no');
        juror = await blockchain.treasury('juror');

        staking = blockchain.openContract(
            await JurorStaking.fromInit(stakingOwner.address, admin.address, stakingTreasury.address),
        );
        await staking.send(stakingOwner.getSender(), { value: toNano('1') }, null);
        await staking.send(stakingOwner.getSender(), { value: toNano('0.2') }, {
            $$type: 'SetPrediction',
            target: admin.address,
        });
        await staking.send(juror.getSender(), { value: toNano('0.2') }, {
            $$type: 'Stake',
            amount: BigInt(20_000),
        });

        prediction = blockchain.openContract(
            await PredictionMarket.fromInit(admin.address, treasury.address, staking.address),
        );
        await prediction.send(admin.getSender(), { value: toNano('1') }, null);
        await staking.send(stakingOwner.getSender(), { value: toNano('0.05') }, {
            $$type: 'SetPrediction',
            target: prediction.address,
        });
    });

    it('creates market, accepts bets, resolves并触发奖励', async () => {
        const closeTime = BigInt(Math.floor(Date.now() / 1000) + 3600);
        await prediction.send(admin.getSender(), { value: toNano('0.2') }, {
            $$type: 'CreateMarket',
            closeTime,
            creatorStake: BigInt(5_000),
            feeBps: BigInt(200),
            metadata: null,
        });

        await prediction.send(bettorYes.getSender(), { value: toNano('0.1') }, {
            $$type: 'PlaceBet',
            marketId: BigInt(1),
            side: BigInt(1),
            amount: BigInt(1_000_000),
        });
        await prediction.send(bettorNo.getSender(), { value: toNano('0.1') }, {
            $$type: 'PlaceBet',
            marketId: BigInt(1),
            side: BigInt(2),
            amount: BigInt(800_000),
        });

        blockchain.now = Math.floor(Number(closeTime) + 10);
        await prediction.send(admin.getSender(), { value: toNano('0.05') }, {
            $$type: 'LockMarket',
            marketId: BigInt(1),
        });

        const rewardList = buildLinkedList([{ address: juror.address, amount: BigInt(360) }]);
        const resolveTx = await prediction.send(admin.getSender(), { value: toNano('0.1') }, {
            $$type: 'ResolveMarket',
            marketId: BigInt(1),
            outcome: BigInt(1),
            creatorPenalty: BigInt(0),
            rewardPayouts: rewardList,
            slashList: null,
        });

        await prediction.send(bettorYes.getSender(), { value: toNano('0.05') }, {
            $$type: 'ClaimWinnings',
            marketId: BigInt(1),
        });

        const stakeInfo = await staking.getStakeOf(juror.address);
        expect(stakeInfo!!.amount).toEqual(BigInt(20_000));
    });
});
