const TOTAL_SUPPLY: Int = 100_000_000_000; // 1000 亿
const SALE_SUPPLY: Int = 8_000_000_000; // 80 亿
const MARKETING_ALLOCATION: Int = 2_000_000_000; // 20 亿
const LOCKED_SUPPLY: Int = 90_000_000_000; // 900 亿
const TOTAL_ROUNDS: Int = 19; // round1 基准 + 18 解锁轮
const MAX_UNLOCK_ROUND: Int = 19;
const UNLOCK_PER_ROUND: Int = 5_000_000_000; // 50 亿
const PRICE_PRECISION: Int = 100_000_000;
const MIN_PRICE: Int = 1;
const REQUIRED_HOLD_SECONDS: Int = 86_400; // 24h
const WHITELIST_WINDOW_SECONDS: Int = 72 * 3_600; // 72 小时

message SetInitialPrice {
    price: Int;
    timestamp: Int;
}

message RecordPrice {
    price: Int;
    timestamp: Int;
    round: Int;
}

message UnlockRound {}

message PauseUnlock {
    value: Bool;
}

message BuyTokens {
    tonAmount: Int;
    taiAmount: Int;
    beneficiary: Address;
}

message ClaimFission {
    recipient: Address;
    amount: Int;
}

message RefundSaleRemainder {}

message StartWhitelistSale {
    merkleRoot: Cell;
    totalAmount: Int;
    baselinePrice: Int;
    currentPrice: Int;
    windowSeconds: Int;
}

message CancelWhitelistSale {}

message PurchaseWhitelist {
    amount: Int;
    quota: Int;
    proof: Cell?;
    beneficiary: Address;
}

message CloseWhitelistSale {}

message TriggerEmergencyBuyback {
    priceNow: Int;
    pricePrev: Int;
}

struct PriceRecord {
    price: Int;
    timestamp: Int;
    round: Int;
}

struct SaleInfo {
    remaining: Int;
    sold: Int;
    endTimestamp: Int;
    closed: Bool;
}

struct UnlockStatus {
    currentRound: Int;
    remainingLocked: Int;
    lastPrice: Int;
    paused: Bool;
}

struct SupplySummary {
    total: Int;
    locked: Int;
    circulating: Int;
}

struct WhitelistSaleInfo {
    active: Bool;
    total: Int;
    sold: Int;
    remaining: Int;
    baselinePrice: Int;
    currentPrice: Int;
    windowEnd: Int;
}

struct WhitelistSale {
    active: Bool;
    merkleRoot: Cell?;
    totalAmount: Int;
    soldAmount: Int;
    baselinePrice: Int;
    currentPrice: Int;
    windowEnd: Int;
}

contract TAIUnlockController {
    admin: Address;
    treasury: Address;
    saleEndTimestamp: Int;
    balances: map<Address, Int>;
    whitelistUsage: map<Address, Int>;

    remainingSaleSupply: Int;
    totalSaleSold: Int;
    saleClosed: Bool;

    remainingLocked: Int;
    currentRound: Int;
    paused: Bool;

    initialPriceSet: Bool;
    lastRoundPrice: Int;
    lastRoundTimestamp: Int;
    lastRoundId: Int;
    pendingPrice: PriceRecord?;

    usdcMaster: Address;
    whitelistSale: WhitelistSale;
    reserveUsdc: Int;
    reserveUsdt: Int;

    init(admin: Address, treasury: Address, saleEndTimestamp: Int, usdcMaster: Address) {
        require(saleEndTimestamp > now(), "SALE_END_PAST");

        self.admin = admin;
        self.treasury = treasury;
        self.saleEndTimestamp = saleEndTimestamp;
        self.balances = emptyMap();
        self.whitelistUsage = emptyMap();

        let contractAddress = myAddress();
        self.balances.set(contractAddress, TOTAL_SUPPLY - MARKETING_ALLOCATION);
        self.balances.set(treasury, MARKETING_ALLOCATION);

        self.remainingSaleSupply = SALE_SUPPLY;
        self.totalSaleSold = 0;
        self.saleClosed = false;

        self.remainingLocked = LOCKED_SUPPLY;
        self.currentRound = 1; // Round1：基础轮
        self.paused = false;

        self.initialPriceSet = false;
        self.lastRoundPrice = 0;
        self.lastRoundTimestamp = 0;
        self.lastRoundId = 0;
        self.pendingPrice = null;

        self.usdcMaster = usdcMaster;
        self.whitelistSale = WhitelistSale {
            active: false,
            merkleRoot: null,
            totalAmount: 0,
            soldAmount: 0,
            baselinePrice: 0,
            currentPrice: 0,
            windowEnd: 0,
        };
        self.reserveUsdc = 0;
        self.reserveUsdt = 0;
    }

    receive() {
        // accept plain messages
    }

    receive(msg: SetInitialPrice) {
        require(sender() == self.admin, "NOT_ADMIN");
        require(!self.initialPriceSet, "PRICE_ALREADY_SET");
        require(msg.price >= MIN_PRICE, "INVALID_PRICE");
        require(msg.timestamp >= now(), "INVALID_TIME");

        self.lastRoundPrice = msg.price;
        self.lastRoundTimestamp = msg.timestamp;
        self.lastRoundId = 1;
        self.initialPriceSet = true;

        // Event suppressed in current prototype (Tact events unsupported in this version)
    }

    receive(msg: RecordPrice) {
        require(msg.price >= MIN_PRICE, "INVALID_PRICE");
        require(self.initialPriceSet, "PRICE_NOT_INITIALIZED");
        require(msg.timestamp >= self.lastRoundTimestamp, "PRICE_TIME_REWIND");

        self.pendingPrice = PriceRecord {
            price: msg.price,
            timestamp: msg.timestamp,
            round: msg.round
        };

        let nextRound = self.currentRound + 1;
        // Event suppressed in current prototype (Tact events unsupported in this version)
    }

    receive(msg: UnlockRound) {
        require(self.initialPriceSet, "PRICE_NOT_INITIALIZED");
        require(!self.paused, "UNLOCK_PAUSED");
        let targetRound = self.currentRound + 1;
        require(targetRound <= MAX_UNLOCK_ROUND, "ROUND_LIMIT");
        require(self.remainingLocked >= UNLOCK_PER_ROUND, "NO_LOCKED_LIQ");

        let recordOpt = self.pendingPrice;
        require(recordOpt != null, "PRICE_MISSING");
        let record = recordOpt!!;
        require(record.timestamp >= self.lastRoundTimestamp + REQUIRED_HOLD_SECONDS, "HOLD_NOT_MET");

        let requiredInflation = self.requiredInflationForRound(targetRound);
        let lhs = record.price * 100;
        let rhs = self.lastRoundPrice * (100 + requiredInflation);
        require(lhs >= rhs, "INFLATION_NOT_MET");

        self.remainingLocked = self.remainingLocked - UNLOCK_PER_ROUND;
        self.currentRound = targetRound;
        self.lastRoundPrice = record.price;
        self.lastRoundTimestamp = record.timestamp;
        self.lastRoundId = record.round;
        self.pendingPrice = null;

        self.transferTaiInternal(myAddress(), self.treasury, UNLOCK_PER_ROUND);

        // Event suppressed in current prototype (Tact events unsupported in this version)
    }

    receive(msg: PauseUnlock) {
        require(sender() == self.admin, "NOT_ADMIN");
        self.paused = msg.value;
        // Event suppressed in current prototype (Tact events unsupported in this版本)
    }

    receive(msg: BuyTokens) {
        require(!self.saleClosed, "SALE_CLOSED");
        require(now() < self.saleEndTimestamp, "SALE_ENDED");
        require(msg.taiAmount > 0, "INVALID_AMOUNT");
        require(msg.tonAmount > 0, "INVALID_TON");
        require(msg.taiAmount <= self.remainingSaleSupply, "INSUFFICIENT_SALE");
        require(context().value >= msg.tonAmount, "TON_UNDERPAID");

        self.remainingSaleSupply = self.remainingSaleSupply - msg.taiAmount;
        self.totalSaleSold = self.totalSaleSold + msg.taiAmount;

        self.transferTaiInternal(myAddress(), msg.beneficiary, msg.taiAmount);

        // Event suppressed in current prototype (Tact events unsupported in this version)

        if (self.remainingSaleSupply == 0) {
            self.saleClosed = true;
        }
    }

    receive(msg: ClaimFission) {
        require(sender() == self.admin, "NOT_ADMIN");
        require(msg.amount > 0, "INVALID_AMOUNT");
        require(!self.saleClosed, "SALE_CLOSED");
        require(msg.amount <= self.remainingSaleSupply, "INSUFFICIENT_SALE");

        self.remainingSaleSupply = self.remainingSaleSupply - msg.amount;
        self.totalSaleSold = self.totalSaleSold + msg.amount;
        self.transferTaiInternal(myAddress(), msg.recipient, msg.amount);

        // Event suppressed in current prototype (Tact events unsupported in this version)

        if (self.remainingSaleSupply == 0) {
            self.saleClosed = true;
        }
    }

    receive(msg: RefundSaleRemainder) {
        require(!self.saleClosed, "SALE_ALREADY_CLOSED");
        require(now() >= self.saleEndTimestamp || self.remainingSaleSupply == 0, "SALE_STILL_ACTIVE");

        let remaining = self.remainingSaleSupply;
        if (remaining > 0) {
            self.transferTaiInternal(myAddress(), self.treasury, remaining);
        }
        self.remainingSaleSupply = 0;
        self.saleClosed = true;

        // Event suppressed in current prototype (Tact events unsupported in this version)
    }

    receive(msg: StartWhitelistSale) {
        require(sender() == self.admin, "NOT_ADMIN");
        require(!self.whitelistSale.active, "SALE_ACTIVE");
        require(msg.totalAmount > 0, "INVALID_TOTAL");
        require(msg.baselinePrice >= MIN_PRICE, "INVALID_BASELINE");
        require(msg.windowSeconds > 0, "INVALID_WINDOW");

        let windowSeconds = msg.windowSeconds;
        let mutWindowDuration = windowSeconds;
        if (windowSeconds > WHITELIST_WINDOW_SECONDS) {
            mutWindowDuration = WHITELIST_WINDOW_SECONDS;
        }

        self.whitelistSale = WhitelistSale {
            active: true,
            merkleRoot: msg.merkleRoot,
            totalAmount: msg.totalAmount,
            soldAmount: 0,
            baselinePrice: msg.baselinePrice,
            currentPrice: msg.currentPrice,
            windowEnd: now() + mutWindowDuration,
        };
    }

    receive(msg: CancelWhitelistSale) {
        require(sender() == self.admin, "NOT_ADMIN");
        if (!self.whitelistSale.active) {
            return;
        }

        self.resetWhitelistSale(false);
    }

    receive(msg: CloseWhitelistSale) {
        if (!self.whitelistSale.active) {
            return;
        }

        require(now() >= self.whitelistSale.windowEnd || sender() == self.admin, "WINDOW_ACTIVE");
        self.resetWhitelistSale(true);
    }

    receive(msg: PurchaseWhitelist) {
        require(self.whitelistSale.active, "WL_INACTIVE");
        require(now() <= self.whitelistSale.windowEnd, "WINDOW_CLOSED");
        require(msg.amount > 0, "INVALID_AMOUNT");
        require(msg.quota > 0, "INVALID_QUOTA");

        let merkleRootOpt = self.whitelistSale.merkleRoot;
        require(merkleRootOpt != null, "NO_ROOT");
        let merkleRoot = merkleRootOpt!!;

        let buyer = sender();
        let beneficiary = msg.beneficiary;
        require(buyer == beneficiary, "SENDER_MISMATCH");
        let leaf = self.buildLeafCell(beneficiary, msg.quota);
        let proofCell = msg.proof;
        require(self.verifyMerkleProof(merkleRoot, leaf, proofCell), "INVALID_PROOF");

        let used = self.getWhitelistUsageInternal(beneficiary);
        require(used + msg.amount <= msg.quota, "QUOTA_EXCEEDED");

        require(self.whitelistSale.soldAmount + msg.amount <= self.whitelistSale.totalAmount, "WL_SOLD_OUT");

        self.whitelistUsage.set(beneficiary, used + msg.amount);
        self.whitelistSale.soldAmount = self.whitelistSale.soldAmount + msg.amount;

        let payment = self.calculateStablePayment(msg.amount, self.whitelistSale.baselinePrice);
        self.reserveUsdc = self.reserveUsdc + payment;

        self.transferTaiInternal(myAddress(), beneficiary, msg.amount);

        if (self.whitelistSale.soldAmount >= self.whitelistSale.totalAmount) {
            self.resetWhitelistSale(true);
        }
    }

    receive(msg: TriggerEmergencyBuyback) {
        require(sender() == self.admin, "NOT_ADMIN");
        require(msg.pricePrev > 0, "INVALID_PRICE");
        require(msg.priceNow > 0, "INVALID_PRICE");

        let doubled = msg.priceNow * 2;
        require(doubled <= msg.pricePrev, "DROP_NOT_MET");

        // TODO: Integrate with on-chain DEX to execute buyback using reserveUsdc/reserveUsdt
        // 当前占位：仅记录触发，不改变储备，以免误操作
    }

    get fun saleInfo(): SaleInfo {
        return SaleInfo {
            remaining: self.remainingSaleSupply,
            sold: self.totalSaleSold,
            endTimestamp: self.saleEndTimestamp,
            closed: self.saleClosed
        };
    }

    get fun unlockStatus(): UnlockStatus {
        return UnlockStatus {
            currentRound: self.currentRound,
            remainingLocked: self.remainingLocked,
            lastPrice: self.lastRoundPrice,
            paused: self.paused
        };
    }

    get fun lastRecordedPrice(): PriceRecord? {
        return self.pendingPrice;
    }

    get fun supplySummary(): SupplySummary {
        let contractBalance = self.balanceOfInternal(myAddress());
        let circulating = TOTAL_SUPPLY - contractBalance;
        return SupplySummary {
            total: TOTAL_SUPPLY,
            locked: self.remainingLocked,
            circulating: circulating
        };
    }

    get fun balanceOf(target: Address): Int {
        return self.balanceOfInternal(target);
    }

    get fun whitelistSaleInfo(): WhitelistSaleInfo {
        let remaining = self.whitelistSale.totalAmount - self.whitelistSale.soldAmount;
        if (remaining < 0) {
            remaining = 0;
        }

        return WhitelistSaleInfo {
            active: self.whitelistSale.active,
            total: self.whitelistSale.totalAmount,
            sold: self.whitelistSale.soldAmount,
            remaining: remaining,
            baselinePrice: self.whitelistSale.baselinePrice,
            currentPrice: self.whitelistSale.currentPrice,
            windowEnd: self.whitelistSale.windowEnd,
        };
    }

    get fun whitelistUsed(target: Address): Int {
        return self.getWhitelistUsageInternal(target);
    }

    fun requiredInflationForRound(round: Int): Int {
        if (round >= 2 && round <= 7) {
            return 100;
        }
        if (round >= 8 && round <= 13) {
            return 80;
        }
        if (round >= 14 && round <= 19) {
            return 50;
        }
        return 0;
    }

    fun balanceOfInternal(target: Address): Int {
        let value = self.balances.get(target);
        if (value == null) {
            return 0;
        }
        return value!!;
    }

    fun transferTaiInternal(from: Address, to: Address, amount: Int) {
        require(amount > 0, "INVALID_TRANSFER");
        let fromBalance = self.balanceOfInternal(from);
        require(fromBalance >= amount, "INSUFFICIENT_FUNDS");
        self.balances.set(from, fromBalance - amount);
        let toBalance = self.balanceOfInternal(to);
        self.balances.set(to, toBalance + amount);
    }

    fun buildLeafCell(addr: Address, quota: Int): Cell {
        let builder = beginCell();
        builder.storeAddress(addr);
        builder.storeUint(quota, 64);
        return builder.endCell();
    }

    fun combineCells(left: Cell, right: Cell): Cell {
        let builder = beginCell();
        builder.storeRef(left);
        builder.storeRef(right);
        return builder.endCell();
    }

    fun verifyMerkleProof(root: Cell, leaf: Cell, proofOpt: Cell?): Bool {
        let finalCell = self.foldProof(leaf, proofOpt);
        return finalCell.hash() == root.hash();
    }

    fun foldProof(current: Cell, nodeOpt: Cell?): Cell {
        if (nodeOpt == null) {
            return current;
        }

        let node = nodeOpt!!;
        let slice = node.beginParse();
        let direction = slice.loadUint(1);
        let sibling = slice.loadRef();
        let nextOpt = slice.loadMaybeRef();

        let mutCombined = current;
        if (direction == 0) {
            mutCombined = self.combineCells(sibling, current);
        } else {
            mutCombined = self.combineCells(current, sibling);
        }

        return self.foldProof(mutCombined, nextOpt);
    }

    fun resetWhitelistSale(distributeRemainder: Bool) {
        if (distributeRemainder && self.whitelistSale.soldAmount < self.whitelistSale.totalAmount) {
            let remaining = self.whitelistSale.totalAmount - self.whitelistSale.soldAmount;
            if (remaining > 0) {
                self.transferTaiInternal(myAddress(), self.treasury, remaining);
            }
        }

        self.whitelistSale = WhitelistSale {
            active: false,
            merkleRoot: null,
            totalAmount: 0,
            soldAmount: 0,
            baselinePrice: 0,
            currentPrice: 0,
            windowEnd: 0,
        };
    }

    fun calculateStablePayment(amountTai: Int, price: Int): Int {
        return (amountTai * price) / PRICE_PRECISION;
    }

    fun getWhitelistUsageInternal(addr: Address): Int {
        let raw = self.whitelistUsage.get(addr);
        if (raw == null) {
            return 0;
        }
        return raw!!;
    }
}
