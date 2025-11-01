const TOTAL_LOCKED: Int = 90_000_000_000;
const TOTAL_ROUNDS: Int = 18;
const LOCK_PER_ROUND: Int = TOTAL_LOCKED / TOTAL_ROUNDS;

message ConfigurePrice {
    round: Int;
    price: Int;
}

message ReleaseRound {
    round: Int;
}

struct RoundStatus {
    price: Int;
    configured: Bool;
    released: Bool;
}

struct VestingSummary {
    totalLocked: Int;
    released: Int;
    remaining: Int;
    lastConfiguredRound: Int;
}

contract VestingContract {
    owner: Address;
    token: Address;
    totalLocked: Int;
    released: Int;
    roundPrices: map<Int, Int>;
    roundReleased: map<Int, Bool>;
    lastConfiguredRound: Int;

    init(owner: Address, token: Address, firstRoundPrice: Int) {
        self.owner = owner;
        self.token = token;
        self.totalLocked = TOTAL_LOCKED;
        self.released = 0;
        self.roundPrices = emptyMap();
        self.roundReleased = emptyMap();
        self.roundPrices.set(1, firstRoundPrice);
        self.roundReleased.set(1, false);
        self.lastConfiguredRound = 1;
    }

    receive() {
        // Accept plain messages (including deployment)
    }

    receive(msg: ConfigurePrice) {
        require(sender() == self.owner, "NOT_OWNER");
        require(msg.round > 1, "ROUND_ONE_LOCKED");
        require(msg.round <= TOTAL_ROUNDS, "ROUND_LIMIT");
        require(msg.round == self.lastConfiguredRound + 1, "ORDER");
        require(msg.price > 0, "INVALID_PRICE");
        self.roundPrices.set(msg.round, msg.price);
        self.roundReleased.set(msg.round, false);
        self.lastConfiguredRound = msg.round;
    }

    receive(msg: ReleaseRound) {
        require(sender() == self.owner, "NOT_OWNER");
        require(msg.round >= 1, "INVALID_ROUND");
        require(msg.round <= TOTAL_ROUNDS, "ROUND_LIMIT");
        let price = self.roundPrices.get(msg.round);
        require(price != null, "PRICE_NOT_SET");
        let releasedFlag = self.roundReleased.get(msg.round);
        if (releasedFlag != null) {
            require(releasedFlag!! == false, "ALREADY_RELEASED");
        }
        require(self.released + LOCK_PER_ROUND <= self.totalLocked, "EXCEEDS_LOCKED");
        self.released = self.released + LOCK_PER_ROUND;
        self.roundReleased.set(msg.round, true);
    }

    get fun summary(): VestingSummary {
        let remaining = self.totalLocked - self.released;
        return VestingSummary {
            totalLocked: self.totalLocked,
            released: self.released,
            remaining: remaining,
            lastConfiguredRound: self.lastConfiguredRound
        };
    }

    get fun roundInfo(roundId: Int): RoundStatus {
        let priceOpt = self.roundPrices.get(roundId);
        if (priceOpt == null) {
            return RoundStatus {
                price: 0,
                configured: false,
                released: false
            };
        }
        let releasedOpt = self.roundReleased.get(roundId);
        let isReleased = false;
        if (releasedOpt != null) {
            isReleased = releasedOpt!!;
        }
        return RoundStatus {
            price: priceOpt!!,
            configured: true,
            released: isReleased
        };
    }
}
