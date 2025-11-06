import { Blockchain, SandboxContract, TreasuryContract, SendMessageResult } from '@ton/sandbox';
import { Address, Cell, beginCell, toNano } from '@ton/core';
import { flattenTransaction } from '@ton/test-utils';
import { TAIUnlockController } from '../build/TAIUnlockController/TAIUnlockController_TAIUnlockController';

const PRICE_BASE = BigInt(1_000_000_000); // 1.0 × 10^8

async function deployUnlock(blockchain: Blockchain, admin: Address, treasury: Address, saleEnd: bigint) {
    const contract = blockchain.openContract(await TAIUnlockController.fromInit(admin, treasury, saleEnd, treasury));
    const deployer = await blockchain.treasury('deployer');

    await contract.send(deployer.getSender(), { value: toNano('1') }, null);

    return { contract, deployer };
}

function toAddrString(addr?: Address | string | null) {
    if (!addr) {
        return undefined;
    }
    if (typeof addr === 'string') {
        return addr;
    }
    return addr.toString();
}

function hasTransaction(result: SendMessageResult, match: { from?: Address; to?: Address; success?: boolean }) {
    return result.transactions.some((tx) => {
        const flat = flattenTransaction(tx);
        if (match.from && toAddrString(flat.from) !== match.from.toString()) {
            return false;
        }
        if (match.to && toAddrString(flat.to) !== match.to.toString()) {
            return false;
        }
        if (match.success !== undefined && flat.success !== match.success) {
            return false;
        }
        return true;
    });
}

describe('TAIUnlockController', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let unlock: SandboxContract<TAIUnlockController>;
    let adminWallet: SandboxContract<TreasuryContract>;
    let treasuryWallet: SandboxContract<TreasuryContract>;
    let saleEnd: bigint;
    let buyerWallet: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        adminWallet = await blockchain.treasury('admin');
        treasuryWallet = await blockchain.treasury('treasury');
        saleEnd = BigInt(Math.floor(Date.now() / 1000) + 86400);
        buyerWallet = await blockchain.treasury('buyer');

        const deployed = await deployUnlock(blockchain, adminWallet.address, treasuryWallet.address, saleEnd);
        unlock = deployed.contract;
        deployer = deployed.deployer;
    });

    it('should deploy and set initial balances', async () => {
        const saleInfo = await unlock.getSaleInfo();
        expect(saleInfo.remaining).toEqual(BigInt(8_000_000_000));
        expect(saleInfo.closed).toBe(false);

        const unlockStatus = await unlock.getUnlockStatus();
        expect(unlockStatus.currentRound).toEqual(BigInt(1));
        expect(unlockStatus.remainingLocked).toEqual(BigInt(90_000_000_000));

        const treasuryBalance = await unlock.getBalanceOf(treasuryWallet.address);
        expect(treasuryBalance).toEqual(BigInt(2_000_000_000));
    });

    it('allows admin to set initial price once', async () => {
        const initialPriceTx = await unlock.send(adminWallet.getSender(), { value: toNano('0.1') }, {
            $$type: 'SetInitialPrice',
            price: PRICE_BASE,
            timestamp: BigInt(Math.floor(Date.now() / 1000) + 3600),
        });
        expect(hasTransaction(initialPriceTx, { success: true })).toBe(true);

        const secondTx = await unlock.send(adminWallet.getSender(), { value: toNano('0.1') }, {
            $$type: 'SetInitialPrice',
            price: PRICE_BASE,
            timestamp: BigInt(Math.floor(Date.now() / 1000) + 7200),
        });
        expect(hasTransaction(secondTx, { success: false })).toBe(true);
    });

    it('records price and unlocks round when conditions met', async () => {
        const nowTs = BigInt(Math.floor(Date.now() / 1000));

        await unlock.send(adminWallet.getSender(), { value: toNano('0.1') }, {
            $$type: 'SetInitialPrice',
            price: PRICE_BASE,
            timestamp: nowTs,
        });

        await unlock.send(adminWallet.getSender(), { value: toNano('0.1') }, {
            $$type: 'RecordPrice',
            price: PRICE_BASE * BigInt(2),
            timestamp: nowTs + BigInt(90_000),
            round: BigInt(100),
        });

        const treasuryBefore = await unlock.getBalanceOf(treasuryWallet.address);

        await unlock.send(deployer.getSender(), { value: toNano('0.1') }, {
            $$type: 'UnlockRound',
        });

        const status = await unlock.getUnlockStatus();
        expect(status.currentRound).toEqual(BigInt(2));
        expect(status.remainingLocked).toEqual(BigInt(85_000_000_000));

        const treasuryAfter = await unlock.getBalanceOf(treasuryWallet.address);
        expect(treasuryAfter - treasuryBefore).toEqual(BigInt(5_000_000_000));

        const pending = await unlock.getLastRecordedPrice();
        expect(pending).toBeNull();
    });

    it('refuses unlock if inflation not met', async () => {
        const nowTs = BigInt(Math.floor(Date.now() / 1000));

        await unlock.send(adminWallet.getSender(), { value: toNano('0.1') }, {
            $$type: 'SetInitialPrice',
            price: PRICE_BASE,
            timestamp: nowTs,
        });

        await unlock.send(adminWallet.getSender(), { value: toNano('0.1') }, {
            $$type: 'RecordPrice',
            price: PRICE_BASE,
            timestamp: nowTs + BigInt(90_000),
            round: BigInt(101),
        });

        const tx = await unlock.send(deployer.getSender(), { value: toNano('0.1') }, {
            $$type: 'UnlockRound',
        });

        expect(hasTransaction(tx, { success: false })).toBe(true);
    });

    it('allows sale buy and refund after end', async () => {
        const buyer = await blockchain.treasury('buyer');

        const buyTx = await unlock.send(buyer.getSender(), { value: toNano('1') }, {
            $$type: 'BuyTokens',
            tonAmount: toNano('1'),
            taiAmount: BigInt(1_000_000),
            beneficiary: buyer.address,
        });
        expect(hasTransaction(buyTx, { success: true })).toBe(true);

        blockchain.now = Number(saleEnd + BigInt(1));

        const treasuryBeforeRefund = await unlock.getBalanceOf(treasuryWallet.address);

        await unlock.send(buyer.getSender(), { value: toNano('0.1') }, {
            $$type: 'RefundSaleRemainder',
        });

        const info = await unlock.getSaleInfo();
        expect(info.remaining).toEqual(BigInt(0));
        expect(info.closed).toBe(true);

        const treasuryAfterRefund = await unlock.getBalanceOf(treasuryWallet.address);
        expect(treasuryAfterRefund - treasuryBeforeRefund).toEqual(BigInt(8_000_000_000 - 1_000_000));
    });

    it('supports whitelist sale lifecycle', async () => {
        const merkleRoot = buildWhitelistLeaf(adminWallet.address, 1_000_000n);

        const startTx = await unlock.send(adminWallet.getSender(), { value: toNano('0.2') }, {
            $$type: 'StartWhitelistSale',
            merkleRoot,
            totalAmount: BigInt(1_000_000_000),
            baselinePrice: BigInt(50_000_000),
            currentPrice: BigInt(80_000_000),
            windowSeconds: BigInt(72 * 3600),
        });
        expect(hasTransaction(startTx, { success: true })).toBe(true);

        const saleInfo = await unlock.getWhitelistSaleInfo();
        expect(saleInfo.active).toBe(true);

        const cancelTx = await unlock.send(adminWallet.getSender(), { value: toNano('0.05') }, {
            $$type: 'CancelWhitelistSale',
        });
        expect(hasTransaction(cancelTx, { success: true })).toBe(true);

        const saleInfoAfterCancel = await unlock.getWhitelistSaleInfo();
        expect(saleInfoAfterCancel.active).toBe(false);
    });

});

function buildWhitelistLeaf(addr: Address, quota: bigint): Cell {
    return beginCell().storeAddress(addr).storeUint(quota, 64).endCell();
}
