const MIN_STAKE_AMOUNT: Int = 10_000;
const DAY_SECONDS: Int = 86_400;
const QUOTA_CAP_RATIO_NUM: Int = 50;   // 50%
const QUOTA_CAP_RATIO_DEN: Int = 100;
const QUOTA_AMOUNT_NUM: Int = 8;       // 0.8 × stake amount
const QUOTA_AMOUNT_DEN: Int = 10;
const QUOTA_DAYS_NUM: Int = 1;         // 0.01 × days -> 1/100
const QUOTA_DAYS_DEN: Int = 100;

message Stake {
    amount: Int;
}

message Unstake {
    amount: Int;
}

message ClaimReward {}

message PauseStaker {
    target: Address;
    untilTs: Int;
}

message ToggleEmergency {
    value: Bool;
}

message RecordParticipation {
    target: Address;
    deltaPoints: Int;
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

message SetPrediction {
    target: Address;
}

struct StakeInfo {
    amount: Int;
    accumulatedSeconds: Int;
    lastUpdate: Int;
    penaltyCount: Int;
    pausedUntil: Int;
    pendingReward: Int;
    points: Int;
}

contract JurorStaking {
    admin: Address;
    prediction: Address;
    treasury: Address;
    emergencyPaused: Bool;
    totalStaked: Int;
    stakes: map<Address, StakeInfo>;
    rewardCredits: map<Address, Int>;

    init(admin: Address, prediction: Address, treasury: Address) {
        self.admin = admin;
        self.prediction = prediction;
        self.treasury = treasury;
        self.emergencyPaused = false;
        self.totalStaked = 0;
        self.stakes = emptyMap();
        self.rewardCredits = emptyMap();
    }

    receive() {
        // accept ton top-up
    }

    receive(msg: Stake) {
        self.ensureNotPaused();
        require(msg.amount >= MIN_STAKE_AMOUNT, "STAKE_TOO_SMALL");
        let juror = sender();
        let info = self.settleStake(juror);
        self.ensureNotSuspended(info);
        info.amount = info.amount + msg.amount;
        self.totalStaked = self.totalStaked + msg.amount;
        self.stakes.set(juror, info);
    }

    receive(msg: Unstake) {
        self.ensureNotPaused();
        let juror = sender();
        let info = self.settleStake(juror);
        self.ensureNotSuspended(info);
        require(msg.amount > 0, "AMOUNT_ZERO");
        require(msg.amount <= info.amount, "INSUFFICIENT_STAKE");
        info.amount = info.amount - msg.amount;
        self.totalStaked = self.totalStaked - msg.amount;
        if (info.amount == 0) {
            info.lastUpdate = now();
        }
        self.stakes.set(juror, info);
        self.creditReward(juror, msg.amount); // 退回本金记账（实际资金由后台发放）
    }

    receive(_: ClaimReward) {
        let juror = sender();
        let infoOpt = self.stakes.get(juror);
        require(infoOpt != null, "NO_STAKE");
        let info = infoOpt!!;
        self.ensureNotSuspended(info);
        let reward = info.pendingReward;
        require(reward > 0, "NO_REWARD");
        info.pendingReward = 0;
        self.stakes.set(juror, info);
        self.creditReward(juror, reward);
    }

    receive(msg: PauseStaker) {
        self.ensureAdmin();
        let info = self.settleStake(msg.target);
        info.pausedUntil = msg.untilTs;
        self.stakes.set(msg.target, info);
    }

    receive(msg: ToggleEmergency) {
        self.ensureAdmin();
        self.emergencyPaused = msg.value;
    }

    receive(msg: RecordParticipation) {
        self.ensureAdmin();
        let info = self.settleStake(msg.target);
        info.points = info.points + msg.deltaPoints;
        self.stakes.set(msg.target, info);
    }

    receive(msg: CreditRewards) {
        self.ensurePrediction();
        if (msg.reward <= 0) {
            return;
        }
        self.processPayoutList(msg.payouts, true);
    }

    receive(msg: ApplySlash) {
        self.ensurePrediction();
        self.processPayoutList(msg.entries, false);
    }

    receive(msg: SetPrediction) {
        self.ensureAdmin();
        self.prediction = msg.target;
    }

    get fun stakeOf(user: Address): StakeInfo? {
        return self.stakes.get(user);
    }

    get fun stakeAmountOf(user: Address): Int {
        let infoOpt = self.stakes.get(user);
        if (infoOpt == null) {
            return 0;
        }
        return infoOpt!!.amount;
    }

    get fun stakeDaysOf(user: Address): Int {
        let infoOpt = self.stakes.get(user);
        if (infoOpt == null) {
            return 0;
        }
        let info = infoOpt!!;
        let extra = 0;
        if (info.amount > 0) {
            extra = now() - info.lastUpdate;
        }
        if (extra < 0) {
            extra = 0;
        }
        let totalSeconds = info.accumulatedSeconds + extra;
        if (totalSeconds <= 0) {
            return 0;
        }
        return totalSeconds / DAY_SECONDS;
    }

    get fun whitelistQuotaOf(user: Address): Int {
        let amount = self.stakeAmountOf(user);
        let days = self.stakeDaysOf(user);
        let quotaAmount = (amount * QUOTA_AMOUNT_NUM) / QUOTA_AMOUNT_DEN;
        let quotaDays = (days * QUOTA_DAYS_NUM) / QUOTA_DAYS_DEN;
        let quota = quotaAmount + quotaDays;
        let cap = (amount * QUOTA_CAP_RATIO_NUM) / QUOTA_CAP_RATIO_DEN;
        if (quota > cap) {
            quota = cap;
        }
        if (quota < 0) {
            quota = 0;
        }
        return quota;
    }

    get fun rewardCreditOf(user: Address): Int {
        let saved = self.rewardCredits.get(user);
        if (saved == null) {
            return 0;
        }
        return saved!!;
    }

    fun settleStake(user: Address): StakeInfo {
        let infoOpt = self.stakes.get(user);
        if (infoOpt == null) {
            return StakeInfo {
                amount: 0,
                accumulatedSeconds: 0,
                lastUpdate: now(),
                penaltyCount: 0,
                pausedUntil: 0,
                pendingReward: 0,
                points: 0,
            };
        }
        let mutInfo = infoOpt!!;
        let current = now();
        if (mutInfo.amount > 0 && current > mutInfo.lastUpdate) {
            let delta = current - mutInfo.lastUpdate;
            mutInfo.accumulatedSeconds = mutInfo.accumulatedSeconds + delta;
        }
        mutInfo.lastUpdate = current;
        return mutInfo;
    }

    fun processPayoutList(cellOpt: Cell?, isReward: Bool) {
        if (cellOpt == null) {
            return;
        }
        let slice = cellOpt!!.beginParse();
        let addr = slice.loadAddress();
        let amount = slice.loadInt(257);
        let nextOpt = slice.loadMaybeRef();
        if (amount > 0) {
            if (isReward) {
                let info = self.settleStake(addr);
                info.pendingReward = info.pendingReward + amount;
                self.stakes.set(addr, info);
            } else {
                let info = self.settleStake(addr);
                let penalty = min(amount, info.amount);
                if (penalty > 0) {
                    info.amount = info.amount - penalty;
                    info.penaltyCount = info.penaltyCount + 1;
                    self.totalStaked = self.totalStaked - penalty;
                    self.creditReward(self.treasury, penalty);
                }
                self.stakes.set(addr, info);
            }
        }
        self.processPayoutList(nextOpt, isReward);
    }

    fun creditReward(user: Address, amount: Int) {
        if (amount <= 0) {
            return;
        }
        let prev = self.rewardCredits.get(user);
        let next = amount;
        if (prev != null) {
            next = prev!! + amount;
        }
        self.rewardCredits.set(user, next);
    }

    fun ensureAdmin() {
        require(sender() == self.admin, "NOT_ADMIN");
    }

    fun ensurePrediction() {
        require(sender() == self.prediction, "NOT_PREDICTION");
    }

    fun ensureNotPaused() {
        require(!self.emergencyPaused, "EMERGENCY");
    }

    fun ensureNotSuspended(info: StakeInfo) {
        if (info.pausedUntil > 0) {
            require(now() >= info.pausedUntil, "SUSPENDED");
        }
    }
}
