#!/usr/bin/env node
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(new URL(import.meta.url).pathname);
require('ts-node').register({ transpileOnly: true, compilerOptions: { module: 'commonjs', target: 'ES2020' } });

const {
    computeLinkedContracts,
    stateInitToHex,
    toUserFriendly,
    ADMIN_ADDRESS_RAW,
    FIRST_ROUND_PRICE,
    MASTER_TOTAL_SUPPLY,
    LOCKED_SUPPLY,
} = require('../contracts/scripts/contractSetup.cjs');

(async () => {
    const repoRoot = path.resolve(__dirname, '..');
    const addressesPath = path.join(repoRoot, 'addresses.json');
    if (!fs.existsSync(addressesPath)) {
        throw new Error(`addresses.json not found at ${addressesPath}. Run the deployment script first.`);
    }

    const payload = JSON.parse(fs.readFileSync(addressesPath, 'utf-8'));

    const { ownerAddress, master, vesting, firstRoundPrice, constants } = await computeLinkedContracts();

    const expectedMasterAddress = toUserFriendly(master.address);
    const expectedVestingAddress = toUserFriendly(vesting.address);
    const expectedMasterInitHex = stateInitToHex(master.init);
    const expectedVestingInitHex = stateInitToHex(vesting.init);

    const checkpoints = [];

    checkpoints.push({
        label: 'Admin wallet matches request',
        pass: payload.admin?.raw === ADMIN_ADDRESS_RAW,
        actual: payload.admin?.raw,
        expected: ADMIN_ADDRESS_RAW,
    });

    checkpoints.push({
        label: 'TAIMaster address deterministic',
        pass: payload.contracts?.TAIMaster?.address === expectedMasterAddress,
        actual: payload.contracts?.TAIMaster?.address,
        expected: expectedMasterAddress,
    });

    checkpoints.push({
        label: 'VestingContract address deterministic',
        pass: payload.contracts?.VestingContract?.address === expectedVestingAddress,
        actual: payload.contracts?.VestingContract?.address,
        expected: expectedVestingAddress,
    });

    checkpoints.push({
        label: 'TAIMaster stateInit hex matches build',
        pass: payload.contracts?.TAIMaster?.stateInitHex === expectedMasterInitHex,
    });

    checkpoints.push({
        label: 'VestingContract stateInit hex matches build',
        pass: payload.contracts?.VestingContract?.stateInitHex === expectedVestingInitHex,
    });

    checkpoints.push({
        label: 'First round price preserved',
        pass: payload.firstRoundPrice === FIRST_ROUND_PRICE.toString(),
        actual: payload.firstRoundPrice,
        expected: FIRST_ROUND_PRICE.toString(),
    });

    const circulating = (MASTER_TOTAL_SUPPLY - LOCKED_SUPPLY).toString();
    checkpoints.push({
        label: 'Unlocked balance (post-lock) correct',
        pass: payload.contracts?.TAIMaster?.totalSupply === MASTER_TOTAL_SUPPLY.toString()
            && payload.contracts?.TAIMaster?.lockedSupply === LOCKED_SUPPLY.toString(),
        actual: {
            totalSupply: payload.contracts?.TAIMaster?.totalSupply,
            lockedSupply: payload.contracts?.TAIMaster?.lockedSupply,
            circulating,
        },
        expected: {
            totalSupply: MASTER_TOTAL_SUPPLY.toString(),
            lockedSupply: LOCKED_SUPPLY.toString(),
            circulating,
        },
    });

    const failed = checkpoints.filter((c) => !c.pass);

    for (const check of checkpoints) {
        const status = check.pass ? 'PASS' : 'FAIL';
        console.log(`[${status}] ${check.label}`);
        if (!check.pass && check.expected !== undefined) {
            console.log(`  expected: ${JSON.stringify(check.expected)}`);
            console.log(`  actual:   ${JSON.stringify(check.actual)}`);
        }
    }

    if (failed.length > 0) {
        process.exitCode = 1;
        console.error(`\nVerification failed on ${failed.length} checkpoint(s).`);
    } else {
        console.log('\nVerification succeeded: balances and first round price are consistent.');
    }
})();
