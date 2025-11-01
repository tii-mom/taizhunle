import { promises as fs } from 'fs';
import * as path from 'path';
import { toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
const {
    ADMIN_ADDRESS_RAW,
    computeLinkedContracts,
    stateInitToHex,
    toUserFriendly,
    FIRST_ROUND_PRICE,
} = require('./contractSetup.cjs');
import { TAIMaster } from '../build/TAIMaster/TAIMaster_TAIMaster';
import { VestingContract } from '../build/VestingContract/VestingContract_VestingContract';

async function upsertEnv(envPath: string, values: Record<string, string>) {
    let existing = '';
    try {
        existing = await fs.readFile(envPath, 'utf-8');
    } catch (err: any) {
        if (err.code !== 'ENOENT') {
            throw err;
        }
    }

    const lines = existing.split(/\r?\n/).filter((line) => line.length > 0);
    const map = new Map<string, string>();
    for (const line of lines) {
        const [key, ...rest] = line.split('=');
        if (key) {
            map.set(key, rest.join('='));
        }
    }

    for (const [key, value] of Object.entries(values)) {
        map.set(key, value);
    }

    const nextContent = Array.from(map.entries())
        .map(([key, value]) => `${key}=${value}`)
        .join('\n') + '\n';

    await fs.writeFile(envPath, nextContent, 'utf-8');
}

export async function run(provider: NetworkProvider) {
    const repoRoot = path.resolve(__dirname, '../..');
    const addressesPath = path.join(repoRoot, 'addresses.json');
    const envPath = path.join(repoRoot, '.env.local');

    const { ownerAddress, master, vesting, constants, firstRoundPrice } = await computeLinkedContracts();

    const payload = {
        admin: {
            raw: ADMIN_ADDRESS_RAW,
            friendly: toUserFriendly(ownerAddress),
        },
        firstRoundPrice: firstRoundPrice.toString(),
        contracts: {
            TAIMaster: {
                address: toUserFriendly(master.address),
                workchain: master.address.workChain,
                stateInitHex: stateInitToHex(master.init!),
                totalSupply: constants.totalSupply.toString(),
                lockedSupply: constants.lockedSupply.toString(),
            },
            VestingContract: {
                address: toUserFriendly(vesting.address),
                workchain: vesting.address.workChain,
                stateInitHex: stateInitToHex(vesting.init!),
                totalLocked: constants.totalLocked.toString(),
                perRoundUnlock: constants.perRoundUnlock.toString(),
                totalRounds: constants.totalRounds.toString(),
            },
        },
    };

    await fs.writeFile(addressesPath, JSON.stringify(payload, null, 2), 'utf-8');
    await upsertEnv(envPath, {
        TAI_MASTER_ADDRESS: payload.contracts.TAIMaster.address,
        TAI_VESTING_ADDRESS: payload.contracts.VestingContract.address,
        TAI_FIRST_ROUND_PRICE: payload.firstRoundPrice,
    });

    console.log(`addresses.json written to ${addressesPath}`);
    console.log(`.env.local updated with latest addresses`);

    const sender = provider.sender();
    const vestingOpened = provider.open(VestingContract.fromAddress(vesting.address));
    const masterOpened = provider.open(TAIMaster.fromAddress(master.address));

    try {
        await sender.send({
            to: vesting.address,
            value: toNano('0.5'),
            init: vesting.init!,
        });
        await provider.waitForDeploy(vesting.address);
        console.log(`Vesting contract deploy message sent.`);
    } catch (err: any) {
        console.log(`Skipping vesting deploy: ${err?.message ?? err}`);
    }

    try {
        await sender.send({
            to: master.address,
            value: toNano('0.5'),
            init: master.init!,
        });
        await provider.waitForDeploy(master.address);
        console.log(`TAIMaster contract deploy message sent.`);
    } catch (err: any) {
        console.log(`Skipping TAIMaster deploy: ${err?.message ?? err}`);
    }

    try {
        await masterOpened.send(sender, { value: toNano('0.2') }, { $$type: 'TransferLocked' });
        console.log(`TransferLocked triggered to move locked allocation to vesting.`);
    } catch (err: any) {
        console.log(`Skipping TransferLocked call: ${err?.message ?? err}`);
    }

    console.log(`First round price used: ${FIRST_ROUND_PRICE.toString()}`);
}
