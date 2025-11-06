const MAX_DEVIATION_BPS: Int = 3000; // ±30%
const DAY_SECONDS: Int = 86_400;

message PushPrice {
    timestamp: Int;
    price: Int;
}

message BatchPushPrice {
    entries: Cell?; // linked list of (timestamp:int257, price:int257)
}

message ResetPrice {
    timestamp: Int;
    price: Int;
}

struct PriceEntry {
    timestamp: Int;
    price: Int;
}

struct AvgState {
    sum: Int;
    count: Int;
}

contract TaiOracle {
    admin: Address;
    priceHistory: map<Int, PriceEntry>;
    latestEntry: PriceEntry?;

    init(admin: Address) {
        self.admin = admin;
        self.priceHistory = emptyMap();
        self.latestEntry = null;
    }

    receive() {}

    receive(msg: PushPrice) {
        self.ensureAdmin();
        self.storeEntry(msg.timestamp, msg.price);
    }

    receive(msg: BatchPushPrice) {
        self.ensureAdmin();
        self.ingestBatch(msg.entries);
    }

    receive(msg: ResetPrice) {
        self.ensureAdmin();
        self.storeEntry(msg.timestamp, msg.price);
    }

    get fun latest(): PriceEntry? {
        return self.latestEntry;
    }

    get fun priceAt(dayIndex: Int): PriceEntry? {
        return self.priceHistory.get(dayIndex);
    }

    get fun average(days: Int): Int {
        if (days <= 0) {
            return 0;
        }
        let latestOpt = self.latestEntry;
        if (latestOpt == null) {
            return 0;
        }
        let latest = latestOpt!!;
        let basePrice = latest.price;
        if (basePrice <= 0) {
            return 0;
        }
        let dayIndex = latest.timestamp / DAY_SECONDS;
        let acc = self.accumulate(dayIndex, days, basePrice, AvgState { sum: 0, count: 0 });
        if (acc.count == 0) {
            return 0;
        }
        return acc.sum / acc.count;
    }

    get fun canUnlock(lastPrice: Int, requiredBps: Int): Bool {
        let avg = self.average(3);
        if (avg <= 0) {
            return false;
        }
        let threshold = (lastPrice * (10_000 + requiredBps)) / 10_000;
        return avg >= threshold;
    }

    fun storeEntry(timestamp: Int, price: Int) {
        require(timestamp > 0, "BAD_TS");
        require(price > 0, "BAD_PRICE");
        let latestOpt = self.latestEntry;
        if (latestOpt != null) {
            require(timestamp > latestOpt!!.timestamp, "NON_MONOTONIC");
        }
        let dayIndex = timestamp / DAY_SECONDS;
        let entry = PriceEntry { timestamp: timestamp, price: price };
        self.priceHistory.set(dayIndex, entry);
        self.latestEntry = entry;
    }

    fun ingestBatch(cellOpt: Cell?) {
        if (cellOpt == null) {
            return;
        }
        let slice = cellOpt!!.beginParse();
        let timestamp = slice.loadInt(257);
        let price = slice.loadInt(257);
        let nextOpt = slice.loadMaybeRef();
        self.storeEntry(timestamp, price);
        self.ingestBatch(nextOpt);
    }

    fun accumulate(day: Int, remaining: Int, basePrice: Int, acc: AvgState): AvgState {
        if (remaining <= 0) {
            return acc;
        }
        let entryOpt = self.priceHistory.get(day);
        let mutAcc = acc;
        if (entryOpt != null) {
            let price = entryOpt!!.price;
            if (self.withinDeviation(basePrice, price)) {
                mutAcc.sum = mutAcc.sum + price;
                mutAcc.count = mutAcc.count + 1;
            }
        }
        return self.accumulate(day - 1, remaining - 1, basePrice, mutAcc);
    }

    fun withinDeviation(basePrice: Int, price: Int): Bool {
        let diff = self.abs(price - basePrice);
        let limit = (basePrice * MAX_DEVIATION_BPS) / 10_000;
        return diff <= limit;
    }

    fun abs(value: Int): Int {
        if (value < 0) {
            return -value;
        }
        return value;
    }

    fun ensureAdmin() {
        require(sender() == self.admin, "NOT_ADMIN");
    }
}
