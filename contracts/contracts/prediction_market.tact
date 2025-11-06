const MIN_CREATOR_STAKE: Int = 1_000;
const MIN_BET_AMOUNT: Int = 10;
const DEFAULT_FEE_BPS: Int = 200;       // 2%
const DEFAULT_REWARD_BPS: Int = 100;    // 1%
const MAX_FEE_BPS: Int = 500;           // 5%
const STATUS_OPEN: Int = 0;
const STATUS_LOCKED: Int = 1;
const STATUS_RESOLVED: Int = 2;
const STATUS_VOID: Int = 3;

message CreateMarket {
    closeTime: Int;
    creatorStake: Int;
    feeBps: Int;
    metadata: Cell?;
}

message PlaceBet {
    marketId: Int;
    side: Int;          // 1 = YES, 2 = NO
    amount: Int;
}

message LockMarket {
    marketId: Int;
}

message ResolveMarket {
    marketId: Int;
    outcome: Int;       // 1 = YES, 2 = NO, 3 = VOID
    creatorPenalty: Int;
    rewardPayouts: Cell?;   // linked list: addr(int257) + amount(int257) + maybeRef
    slashList: Cell?;
}

message CreditRewards {
    marketId: Int;
    reward: Int;
    payouts: Cell?;
}

message ApplySlash {
    marketId: Int;
    entries: Cell?;
}

message ClaimWinnings {
    marketId: Int;
}

message ClaimCreatorStake {
    marketId: Int;
}

message VoidMarket {
    marketId: Int;
    reason: Int;
}

message WithdrawFees {}

struct Market {
    id: Int;
    creator: Address;
    closeTime: Int;
    status: Int;
    outcome: Int;
    creatorStake: Int;
    yesPool: Int;
    noPool: Int;
    feeBps: Int;
    rewardBps: Int;
    platformFees: Int;
    rewardPool: Int;
    resolvedAt: Int;
    metadata: Cell?;
}

struct BetPosition {
    yesAmount: Int;
    noAmount: Int;
    claimedYes: Bool;
    claimedNo: Bool;
}

struct PositionBook {
    entries: map<Address, BetPosition>;
}

struct AverageAcc {
    sum: Int;
    count: Int;
}

contract PredictionMarket {
    admin: Address;
    treasury: Address;
    staking: Address;
    nextMarketId: Int;
    markets: map<Int, Market>;
    positions: map<Int, PositionBook>;
    userCredits: map<Address, Int>;
    platformVault: Int;

    init(admin: Address, treasury: Address, staking: Address) {
        self.admin = admin;
        self.treasury = treasury;
        self.staking = staking;
        self.nextMarketId = 1;
        self.markets = emptyMap();
        self.positions = emptyMap();
        self.userCredits = emptyMap();
        self.platformVault = 0;
    }

    receive() {
        // accept plain messages (e.g. for gas top-up)
    }

    receive(msg: CreateMarket) {
        let creator = sender();
        require(msg.creatorStake >= MIN_CREATOR_STAKE, "STAKE_TOO_LOW");
        require(msg.closeTime > now(), "INVALID_CLOSE");

        let feeBps = msg.feeBps;
        if (feeBps <= 0 || feeBps > MAX_FEE_BPS) {
            feeBps = DEFAULT_FEE_BPS;
        }

        let marketId = self.nextMarketId;
        self.nextMarketId = self.nextMarketId + 1;

        let market = Market {
            id: marketId,
            creator: creator,
            closeTime: msg.closeTime,
            status: STATUS_OPEN,
            outcome: 0,
            creatorStake: msg.creatorStake,
            yesPool: 0,
            noPool: 0,
            feeBps: feeBps,
            rewardBps: DEFAULT_REWARD_BPS,
            platformFees: 0,
            rewardPool: 0,
            resolvedAt: 0,
            metadata: msg.metadata,
        };

        self.markets.set(marketId, market);
    }

    receive(msg: PlaceBet) {
        let bettor = sender();
        require(msg.amount >= MIN_BET_AMOUNT, "BET_TOO_SMALL");
        require(msg.side == 1 || msg.side == 2, "INVALID_SIDE");

        let marketOpt = self.markets.get(msg.marketId);
        require(marketOpt != null, "MARKET_NOT_FOUND");
        let market = marketOpt!!;
        require(market.status == STATUS_OPEN, "MARKET_NOT_OPEN");
        require(now() < market.closeTime, "MARKET_CLOSED");

        let fee = (msg.amount * market.feeBps) / 10_000;
        if (fee < 0) {
            fee = 0;
        }
        let reward = (fee * market.rewardBps) / 10_000;
        if (reward < 0) {
            reward = 0;
        }
        if (reward > fee) {
            reward = fee;
        }
        let netAmount = msg.amount - fee;
        require(netAmount > 0, "NET_ZERO");

        if (msg.side == 1) {
            market.yesPool = market.yesPool + netAmount;
        } else {
            market.noPool = market.noPool + netAmount;
        }
        market.platformFees = market.platformFees + (fee - reward);
        market.rewardPool = market.rewardPool + reward;
        self.platformVault = self.platformVault + (fee - reward);

        let bookOpt = self.positions.get(msg.marketId);
        let book = PositionBook { entries: emptyMap() };
        if (bookOpt != null) {
            book = bookOpt!!;
        }
        let positionOpt = book.entries.get(bettor);
        let position = BetPosition { yesAmount: 0, noAmount: 0, claimedYes: false, claimedNo: false };
        if (positionOpt != null) {
            position = positionOpt!!;
        }

        if (msg.side == 1) {
            position.yesAmount = position.yesAmount + netAmount;
        } else {
            position.noAmount = position.noAmount + netAmount;
        }

        book.entries.set(bettor, position);
        self.positions.set(msg.marketId, book);
        self.markets.set(msg.marketId, market);
    }

    receive(msg: LockMarket) {
        self.ensureAdmin();
        let marketOpt = self.markets.get(msg.marketId);
        require(marketOpt != null, "MARKET_NOT_FOUND");
        let mutMarket = marketOpt!!;
        require(mutMarket.status == STATUS_OPEN, "ALREADY_LOCKED");
        if (now() < mutMarket.closeTime) {
            mutMarket.closeTime = now();
        }
        mutMarket.status = STATUS_LOCKED;
        self.markets.set(msg.marketId, mutMarket);
    }

    receive(msg: ResolveMarket) {
        self.ensureAdmin();
        let marketOpt = self.markets.get(msg.marketId);
        require(marketOpt != null, "MARKET_NOT_FOUND");
        let mutMarket = marketOpt!!;
        require(mutMarket.status == STATUS_OPEN || mutMarket.status == STATUS_LOCKED, "BAD_STATUS");
        require(msg.outcome == 1 || msg.outcome == 2 || msg.outcome == 3, "BAD_OUTCOME");

        mutMarket.status = (msg.outcome == 3) ? STATUS_VOID : STATUS_RESOLVED;
        mutMarket.outcome = msg.outcome;
        mutMarket.resolvedAt = now();

        let penalty = min(msg.creatorPenalty, mutMarket.creatorStake);
        if (penalty > 0) {
            mutMarket.creatorStake = mutMarket.creatorStake - penalty;
            self.platformVault = self.platformVault + penalty;
        }

        self.creditUser(mutMarket.creator, mutMarket.creatorStake);
        mutMarket.creatorStake = 0;

        self.handleRewardPayouts(msg.rewardPayouts, msg.marketId, mutMarket.rewardPool);
        mutMarket.rewardPool = 0;
        self.handleSlashList(msg.slashList, msg.marketId);

        self.markets.set(msg.marketId, mutMarket);
    }

    receive(msg: ClaimWinnings) {
        let bettor = sender();
        let marketOpt = self.markets.get(msg.marketId);
        require(marketOpt != null, "MARKET_NOT_FOUND");
        let market = marketOpt!!;
        require(market.status == STATUS_RESOLVED || market.status == STATUS_VOID, "NOT_RESOLVED");

        let bookOpt = self.positions.get(msg.marketId);
        require(bookOpt != null, "NO_BETS");
        let book = bookOpt!!;
        let posOpt = book.entries.get(bettor);
        require(posOpt != null, "NO_POSITION");
        let position = posOpt!!;

        let yesPayout: Int = 0;
        let noPayout: Int = 0;
        let claimedYes = position.claimedYes;
        let claimedNo = position.claimedNo;

        if (market.status == STATUS_VOID) {
            if (position.yesAmount > 0 && !position.claimedYes) {
                yesPayout = position.yesAmount;
                claimedYes = true;
            }
            if (position.noAmount > 0 && !position.claimedNo) {
                noPayout = position.noAmount;
                claimedNo = true;
            }
        } else {
            if (market.outcome == 1 && position.yesAmount > 0 && !position.claimedYes) {
                require(market.yesPool > 0, "POOL_ZERO");
                let rewardYes = (position.yesAmount * market.noPool) / market.yesPool;
                yesPayout = position.yesAmount + rewardYes;
                claimedYes = true;
            }
            if (market.outcome == 2 && position.noAmount > 0 && !position.claimedNo) {
                require(market.noPool > 0, "POOL_ZERO");
                let rewardNo = (position.noAmount * market.yesPool) / market.noPool;
                noPayout = position.noAmount + rewardNo;
                claimedNo = true;
            }
        }

        let totalPayout = yesPayout + noPayout;
        require(totalPayout > 0, "NOTHING_TO_CLAIM");

        let updatedPosition = BetPosition {
            yesAmount: position.yesAmount,
            noAmount: position.noAmount,
            claimedYes: claimedYes,
            claimedNo: claimedNo
        };

        book.entries.set(bettor, updatedPosition);
        self.positions.set(msg.marketId, book);
        self.creditUser(bettor, totalPayout);
    }

    receive(msg: ClaimCreatorStake) {
        let caller = sender();
        let marketOpt = self.markets.get(msg.marketId);
        require(marketOpt != null, "MARKET_NOT_FOUND");
        let market = marketOpt!!;
        require(market.creator == caller, "NOT_CREATOR");
        require(market.status == STATUS_RESOLVED || market.status == STATUS_VOID, "NOT_DONE");
        // creator stake已在 ResolveMarket 时转入 credit，不再重复。
    }

    receive(msg: VoidMarket) {
        self.ensureAdmin();
        let marketOpt = self.markets.get(msg.marketId);
        require(marketOpt != null, "MARKET_NOT_FOUND");
        let mutMarket = marketOpt!!;
        require(mutMarket.status == STATUS_OPEN || mutMarket.status == STATUS_LOCKED, "BAD_STATUS");
        mutMarket.status = STATUS_VOID;
        mutMarket.outcome = 3;
        mutMarket.resolvedAt = now();
        self.creditUser(mutMarket.creator, mutMarket.creatorStake);
        mutMarket.creatorStake = 0;
        self.markets.set(msg.marketId, mutMarket);
    }

    receive(_: WithdrawFees) {
        self.ensureAdmin();
        if (self.platformVault > 0) {
            self.creditUser(self.treasury, self.platformVault);
            self.platformVault = 0;
        }
    }

    get fun marketInfo(id: Int): Market? {
        return self.markets.get(id);
    }

    get fun positionOf(id: Int, user: Address): BetPosition? {
        let bookOpt = self.positions.get(id);
        if (bookOpt == null) {
            return null;
        }
        return bookOpt!!.entries.get(user);
    }

    get fun creditOf(user: Address): Int {
        let saved = self.userCredits.get(user);
        if (saved == null) {
            return 0;
        }
        return saved!!;
    }

    fun handleRewardPayouts(cellOpt: Cell?, marketId: Int, rewardPool: Int) {
        if (cellOpt == null || rewardPool <= 0) {
            return;
        }

        let bodyBuilder = beginCell();
        bodyBuilder.storeUint(291497744, 32); // CreditRewards opcode
        bodyBuilder.storeInt(marketId, 257);
        bodyBuilder.storeInt(rewardPool, 257);
        if (cellOpt != null) {
            bodyBuilder.storeBit(true);
            bodyBuilder.storeRef(cellOpt!!);
        } else {
            bodyBuilder.storeBit(false);
        }
        let body = bodyBuilder.endCell();

        send(SendParameters {
            to: self.staking,
            value: 5_000_000,
            bounce: false,
            mode: 64,
            body: body,
            code: null,
            data: null,
        });
    }

    fun handleSlashList(cellOpt: Cell?, marketId: Int) {
        if (cellOpt == null) {
            return;
        }

        let bodyBuilder = beginCell();
        bodyBuilder.storeUint(2570802865, 32); // ApplySlash opcode
        bodyBuilder.storeInt(marketId, 257);
        if (cellOpt != null) {
            bodyBuilder.storeBit(true);
            bodyBuilder.storeRef(cellOpt!!);
        } else {
            bodyBuilder.storeBit(false);
        }
        let body = bodyBuilder.endCell();

        send(SendParameters {
            to: self.staking,
            value: 5_000_000,
            bounce: false,
            mode: 64,
            body: body,
            code: null,
            data: null,
        });
    }

    fun creditUser(user: Address, amount: Int) {
        if (amount <= 0) {
            return;
        }
        let prev = self.userCredits.get(user);
        let next = amount;
        if (prev != null) {
            next = prev!! + amount;
        }
        self.userCredits.set(user, next);
    }

    fun ensureAdmin() {
        require(sender() == self.admin, "NOT_ADMIN");
    }
}
