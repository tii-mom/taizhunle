#!/usr/bin/env node
const path = require('path');
const { promises: fs } = require('fs');
const {
    computeLinkedContracts,
    stateInitToHex,
    toUserFriendly,
    ADMIN_ADDRESS_RAW,
    FIRST_ROUND_PRICE,
} = require('./contractSetup.cjs');

async function upsertEnv(envPath, values) {
    let existing = '';
    try {
        existing = await fs.readFile(envPath, 'utf-8');
    } catch (err) {
        if (err.code !== 'ENOENT') {
            throw err;
        }
    }

    const lines = existing.split(/\r?\n/).filter((line) => line.length > 0);
    const map = new Map();

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

async function main() {
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
                stateInitHex: stateInitToHex(master.init),
                totalSupply: constants.totalSupply.toString(),
                lockedSupply: constants.lockedSupply.toString(),
            },
            VestingContract: {
                address: toUserFriendly(vesting.address),
                workchain: vesting.address.workChain,
                stateInitHex: stateInitToHex(vesting.init),
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
    console.log('.env.local updated.');
    console.log(`First round price: ${FIRST_ROUND_PRICE.toString()}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
