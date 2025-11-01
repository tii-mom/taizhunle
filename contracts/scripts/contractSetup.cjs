const path = require('path');
const tsNode = require('ts-node');
const project = path.resolve(__dirname, '../tsconfig.json');

// Ensure TypeScript wrappers can be required in CommonJS context
tsNode.register({
    transpileOnly: true,
    project,
    compilerOptions: { module: 'commonjs', target: 'es2020' },
});

const { Address, beginCell } = require('@ton/core');
const { TAIMaster, TOTAL_SUPPLY: MASTER_TOTAL_SUPPLY, LOCKED_SUPPLY } = require('../build/TAIMaster/TAIMaster_TAIMaster.ts');
const { VestingContract, TOTAL_LOCKED, LOCK_PER_ROUND } = require('../build/VestingContract/VestingContract_VestingContract.ts');

const ADMIN_ADDRESS_RAW = '0QCJ4DKMRFQoaT5tlQ3Eo9_GTI5UhmRVdUTfJwnR2xgMmuoT';
const FIRST_ROUND_PRICE = BigInt(1_000_000_000);

async function computeLinkedContracts(ownerAddress = Address.parse(ADMIN_ADDRESS_RAW), firstRoundPrice = FIRST_ROUND_PRICE) {
    let vesting = await VestingContract.fromInit(ownerAddress, ownerAddress, firstRoundPrice);
    let master = await TAIMaster.fromInit(ownerAddress, vesting.address);

    for (let i = 0; i < 10; i++) {
        master = await TAIMaster.fromInit(ownerAddress, vesting.address);
        const nextVesting = await VestingContract.fromInit(ownerAddress, master.address, firstRoundPrice);
        if (nextVesting.address.equals(vesting.address)) {
            vesting = nextVesting;
            break;
        }
        vesting = nextVesting;
    }

    master = await TAIMaster.fromInit(ownerAddress, vesting.address);

    return {
        ownerAddress,
        master,
        vesting,
        constants: {
            totalSupply: MASTER_TOTAL_SUPPLY,
            lockedSupply: LOCKED_SUPPLY,
            totalLocked: TOTAL_LOCKED,
            perRoundUnlock: LOCK_PER_ROUND,
            totalRounds: BigInt(18),
        },
        firstRoundPrice,
    };
}

function stateInitToHex(init) {
    return beginCell().storeRef(init.code).storeRef(init.data).endCell().toBoc().toString('hex');
}

function toUserFriendly(address) {
    return address.toString();
}

module.exports = {
    ADMIN_ADDRESS_RAW,
    FIRST_ROUND_PRICE,
    MASTER_TOTAL_SUPPLY,
    LOCKED_SUPPLY,
    TOTAL_LOCKED,
    LOCK_PER_ROUND,
    computeLinkedContracts,
    stateInitToHex,
    toUserFriendly,
};
