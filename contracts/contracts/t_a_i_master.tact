const TOTAL_SUPPLY: Int = 100_000_000_000;
const LOCKED_SUPPLY: Int = 90_000_000_000;

message TransferLocked {}
message TransferTokens {
    to: Address;
    amount: Int;
}

struct SupplySummary {
    total: Int;
    locked: Int;
    circulating: Int;
    lockedTransferred: Bool;
}

contract TAIMaster {
    owner: Address;
    vesting: Address;
    totalSupply: Int;
    lockedSupply: Int;
    balances: map<Address, Int>;
    lockedMoved: Bool;

    init(owner: Address, vesting: Address) {
        self.owner = owner;
        self.vesting = vesting;
        self.totalSupply = TOTAL_SUPPLY;
        self.lockedSupply = LOCKED_SUPPLY;
        self.lockedMoved = false;
        self.balances = emptyMap();
        self.balances.set(owner, TOTAL_SUPPLY);
    }

    receive() {
        // Accept plain messages (e.g. deployment bounce)
    }

    receive(msg: TransferLocked) {
        require(sender() == self.owner, "NOT_OWNER");
        require(!self.lockedMoved, "ALREADY_LOCKED");
        let ownerBalance = self.balanceOfInternal(self.owner);
        require(ownerBalance >= self.lockedSupply, "INSUFFICIENT");
        self.balances.set(self.owner, ownerBalance - self.lockedSupply);
        let vestingBalance = self.balanceOfInternal(self.vesting);
        self.balances.set(self.vesting, vestingBalance + self.lockedSupply);
        self.lockedMoved = true;
    }

    receive(msg: TransferTokens) {
        require(sender() == self.owner, "NOT_OWNER");
        require(msg.amount > 0, "INVALID_AMOUNT");
        let ownerBalance = self.balanceOfInternal(self.owner);
        require(ownerBalance >= msg.amount, "INSUFFICIENT");
        self.balances.set(self.owner, ownerBalance - msg.amount);
        let receiverBalance = self.balanceOfInternal(msg.to);
        self.balances.set(msg.to, receiverBalance + msg.amount);
    }

    get fun summary(): SupplySummary {
        let circulating = self.totalSupply - self.lockedSupply;
        return SupplySummary {
            total: self.totalSupply,
            locked: self.lockedSupply,
            circulating: circulating,
            lockedTransferred: self.lockedMoved
        };
    }

    get fun balanceOf(target: Address): Int {
        return self.balanceOfInternal(target);
    }

    fun balanceOfInternal(target: Address): Int {
        let saved = self.balances.get(target);
        if (saved == null) {
            return 0;
        }
        return saved!!;
    }
}
