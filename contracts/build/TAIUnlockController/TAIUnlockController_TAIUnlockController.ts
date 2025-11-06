import {
    Cell,
    Slice,
    Address,
    Builder,
    beginCell,
    ComputeError,
    TupleItem,
    TupleReader,
    Dictionary,
    contractAddress,
    address,
    ContractProvider,
    Sender,
    Contract,
    ContractABI,
    ABIType,
    ABIGetter,
    ABIReceiver,
    TupleBuilder,
    DictionaryValue
} from '@ton/core';

export type DataSize = {
    $$type: 'DataSize';
    cells: bigint;
    bits: bigint;
    refs: bigint;
}

export function storeDataSize(src: DataSize) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.cells, 257);
        b_0.storeInt(src.bits, 257);
        b_0.storeInt(src.refs, 257);
    };
}

export function loadDataSize(slice: Slice) {
    const sc_0 = slice;
    const _cells = sc_0.loadIntBig(257);
    const _bits = sc_0.loadIntBig(257);
    const _refs = sc_0.loadIntBig(257);
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadGetterTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function storeTupleDataSize(source: DataSize) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.cells);
    builder.writeNumber(source.bits);
    builder.writeNumber(source.refs);
    return builder.build();
}

export function dictValueParserDataSize(): DictionaryValue<DataSize> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDataSize(src)).endCell());
        },
        parse: (src) => {
            return loadDataSize(src.loadRef().beginParse());
        }
    }
}

export type SignedBundle = {
    $$type: 'SignedBundle';
    signature: Buffer;
    signedData: Slice;
}

export function storeSignedBundle(src: SignedBundle) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBuffer(src.signature);
        b_0.storeBuilder(src.signedData.asBuilder());
    };
}

export function loadSignedBundle(slice: Slice) {
    const sc_0 = slice;
    const _signature = sc_0.loadBuffer(64);
    const _signedData = sc_0;
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadGetterTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function storeTupleSignedBundle(source: SignedBundle) {
    const builder = new TupleBuilder();
    builder.writeBuffer(source.signature);
    builder.writeSlice(source.signedData.asCell());
    return builder.build();
}

export function dictValueParserSignedBundle(): DictionaryValue<SignedBundle> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSignedBundle(src)).endCell());
        },
        parse: (src) => {
            return loadSignedBundle(src.loadRef().beginParse());
        }
    }
}

export type StateInit = {
    $$type: 'StateInit';
    code: Cell;
    data: Cell;
}

export function storeStateInit(src: StateInit) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeRef(src.code);
        b_0.storeRef(src.data);
    };
}

export function loadStateInit(slice: Slice) {
    const sc_0 = slice;
    const _code = sc_0.loadRef();
    const _data = sc_0.loadRef();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadGetterTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function storeTupleStateInit(source: StateInit) {
    const builder = new TupleBuilder();
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

export function dictValueParserStateInit(): DictionaryValue<StateInit> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStateInit(src)).endCell());
        },
        parse: (src) => {
            return loadStateInit(src.loadRef().beginParse());
        }
    }
}

export type Context = {
    $$type: 'Context';
    bounceable: boolean;
    sender: Address;
    value: bigint;
    raw: Slice;
}

export function storeContext(src: Context) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBit(src.bounceable);
        b_0.storeAddress(src.sender);
        b_0.storeInt(src.value, 257);
        b_0.storeRef(src.raw.asCell());
    };
}

export function loadContext(slice: Slice) {
    const sc_0 = slice;
    const _bounceable = sc_0.loadBit();
    const _sender = sc_0.loadAddress();
    const _value = sc_0.loadIntBig(257);
    const _raw = sc_0.loadRef().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadGetterTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function storeTupleContext(source: Context) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.bounceable);
    builder.writeAddress(source.sender);
    builder.writeNumber(source.value);
    builder.writeSlice(source.raw.asCell());
    return builder.build();
}

export function dictValueParserContext(): DictionaryValue<Context> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContext(src)).endCell());
        },
        parse: (src) => {
            return loadContext(src.loadRef().beginParse());
        }
    }
}

export type SendParameters = {
    $$type: 'SendParameters';
    mode: bigint;
    body: Cell | null;
    code: Cell | null;
    data: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeSendParameters(src: SendParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        if (src.code !== null && src.code !== undefined) { b_0.storeBit(true).storeRef(src.code); } else { b_0.storeBit(false); }
        if (src.data !== null && src.data !== undefined) { b_0.storeBit(true).storeRef(src.data); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadSendParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _code = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _data = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleSendParameters(source: SendParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserSendParameters(): DictionaryValue<SendParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSendParameters(src)).endCell());
        },
        parse: (src) => {
            return loadSendParameters(src.loadRef().beginParse());
        }
    }
}

export type MessageParameters = {
    $$type: 'MessageParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeMessageParameters(src: MessageParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadMessageParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleMessageParameters(source: MessageParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserMessageParameters(): DictionaryValue<MessageParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMessageParameters(src)).endCell());
        },
        parse: (src) => {
            return loadMessageParameters(src.loadRef().beginParse());
        }
    }
}

export type DeployParameters = {
    $$type: 'DeployParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    bounce: boolean;
    init: StateInit;
}

export function storeDeployParameters(src: DeployParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeBit(src.bounce);
        b_0.store(storeStateInit(src.init));
    };
}

export function loadDeployParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _bounce = sc_0.loadBit();
    const _init = loadStateInit(sc_0);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadGetterTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadGetterTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function storeTupleDeployParameters(source: DeployParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeBoolean(source.bounce);
    builder.writeTuple(storeTupleStateInit(source.init));
    return builder.build();
}

export function dictValueParserDeployParameters(): DictionaryValue<DeployParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployParameters(src)).endCell());
        },
        parse: (src) => {
            return loadDeployParameters(src.loadRef().beginParse());
        }
    }
}

export type StdAddress = {
    $$type: 'StdAddress';
    workchain: bigint;
    address: bigint;
}

export function storeStdAddress(src: StdAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 8);
        b_0.storeUint(src.address, 256);
    };
}

export function loadStdAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(8);
    const _address = sc_0.loadUintBig(256);
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleStdAddress(source: StdAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeNumber(source.address);
    return builder.build();
}

export function dictValueParserStdAddress(): DictionaryValue<StdAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStdAddress(src)).endCell());
        },
        parse: (src) => {
            return loadStdAddress(src.loadRef().beginParse());
        }
    }
}

export type VarAddress = {
    $$type: 'VarAddress';
    workchain: bigint;
    address: Slice;
}

export function storeVarAddress(src: VarAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 32);
        b_0.storeRef(src.address.asCell());
    };
}

export function loadVarAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(32);
    const _address = sc_0.loadRef().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleVarAddress(source: VarAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeSlice(source.address.asCell());
    return builder.build();
}

export function dictValueParserVarAddress(): DictionaryValue<VarAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVarAddress(src)).endCell());
        },
        parse: (src) => {
            return loadVarAddress(src.loadRef().beginParse());
        }
    }
}

export type BasechainAddress = {
    $$type: 'BasechainAddress';
    hash: bigint | null;
}

export function storeBasechainAddress(src: BasechainAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        if (src.hash !== null && src.hash !== undefined) { b_0.storeBit(true).storeInt(src.hash, 257); } else { b_0.storeBit(false); }
    };
}

export function loadBasechainAddress(slice: Slice) {
    const sc_0 = slice;
    const _hash = sc_0.loadBit() ? sc_0.loadIntBig(257) : null;
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadGetterTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function storeTupleBasechainAddress(source: BasechainAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.hash);
    return builder.build();
}

export function dictValueParserBasechainAddress(): DictionaryValue<BasechainAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBasechainAddress(src)).endCell());
        },
        parse: (src) => {
            return loadBasechainAddress(src.loadRef().beginParse());
        }
    }
}

export type SetInitialPrice = {
    $$type: 'SetInitialPrice';
    price: bigint;
    timestamp: bigint;
}

export function storeSetInitialPrice(src: SetInitialPrice) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3861224729, 32);
        b_0.storeInt(src.price, 257);
        b_0.storeInt(src.timestamp, 257);
    };
}

export function loadSetInitialPrice(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3861224729) { throw Error('Invalid prefix'); }
    const _price = sc_0.loadIntBig(257);
    const _timestamp = sc_0.loadIntBig(257);
    return { $$type: 'SetInitialPrice' as const, price: _price, timestamp: _timestamp };
}

export function loadTupleSetInitialPrice(source: TupleReader) {
    const _price = source.readBigNumber();
    const _timestamp = source.readBigNumber();
    return { $$type: 'SetInitialPrice' as const, price: _price, timestamp: _timestamp };
}

export function loadGetterTupleSetInitialPrice(source: TupleReader) {
    const _price = source.readBigNumber();
    const _timestamp = source.readBigNumber();
    return { $$type: 'SetInitialPrice' as const, price: _price, timestamp: _timestamp };
}

export function storeTupleSetInitialPrice(source: SetInitialPrice) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.price);
    builder.writeNumber(source.timestamp);
    return builder.build();
}

export function dictValueParserSetInitialPrice(): DictionaryValue<SetInitialPrice> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetInitialPrice(src)).endCell());
        },
        parse: (src) => {
            return loadSetInitialPrice(src.loadRef().beginParse());
        }
    }
}

export type RecordPrice = {
    $$type: 'RecordPrice';
    price: bigint;
    timestamp: bigint;
    round: bigint;
}

export function storeRecordPrice(src: RecordPrice) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3167374006, 32);
        b_0.storeInt(src.price, 257);
        b_0.storeInt(src.timestamp, 257);
        b_0.storeInt(src.round, 257);
    };
}

export function loadRecordPrice(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3167374006) { throw Error('Invalid prefix'); }
    const _price = sc_0.loadIntBig(257);
    const _timestamp = sc_0.loadIntBig(257);
    const _round = sc_0.loadIntBig(257);
    return { $$type: 'RecordPrice' as const, price: _price, timestamp: _timestamp, round: _round };
}

export function loadTupleRecordPrice(source: TupleReader) {
    const _price = source.readBigNumber();
    const _timestamp = source.readBigNumber();
    const _round = source.readBigNumber();
    return { $$type: 'RecordPrice' as const, price: _price, timestamp: _timestamp, round: _round };
}

export function loadGetterTupleRecordPrice(source: TupleReader) {
    const _price = source.readBigNumber();
    const _timestamp = source.readBigNumber();
    const _round = source.readBigNumber();
    return { $$type: 'RecordPrice' as const, price: _price, timestamp: _timestamp, round: _round };
}

export function storeTupleRecordPrice(source: RecordPrice) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.price);
    builder.writeNumber(source.timestamp);
    builder.writeNumber(source.round);
    return builder.build();
}

export function dictValueParserRecordPrice(): DictionaryValue<RecordPrice> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRecordPrice(src)).endCell());
        },
        parse: (src) => {
            return loadRecordPrice(src.loadRef().beginParse());
        }
    }
}

export type UnlockRound = {
    $$type: 'UnlockRound';
}

export function storeUnlockRound(src: UnlockRound) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2301350297, 32);
    };
}

export function loadUnlockRound(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2301350297) { throw Error('Invalid prefix'); }
    return { $$type: 'UnlockRound' as const };
}

export function loadTupleUnlockRound(source: TupleReader) {
    return { $$type: 'UnlockRound' as const };
}

export function loadGetterTupleUnlockRound(source: TupleReader) {
    return { $$type: 'UnlockRound' as const };
}

export function storeTupleUnlockRound(source: UnlockRound) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserUnlockRound(): DictionaryValue<UnlockRound> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUnlockRound(src)).endCell());
        },
        parse: (src) => {
            return loadUnlockRound(src.loadRef().beginParse());
        }
    }
}

export type PauseUnlock = {
    $$type: 'PauseUnlock';
    value: boolean;
}

export function storePauseUnlock(src: PauseUnlock) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3107043122, 32);
        b_0.storeBit(src.value);
    };
}

export function loadPauseUnlock(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3107043122) { throw Error('Invalid prefix'); }
    const _value = sc_0.loadBit();
    return { $$type: 'PauseUnlock' as const, value: _value };
}

export function loadTuplePauseUnlock(source: TupleReader) {
    const _value = source.readBoolean();
    return { $$type: 'PauseUnlock' as const, value: _value };
}

export function loadGetterTuplePauseUnlock(source: TupleReader) {
    const _value = source.readBoolean();
    return { $$type: 'PauseUnlock' as const, value: _value };
}

export function storeTuplePauseUnlock(source: PauseUnlock) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.value);
    return builder.build();
}

export function dictValueParserPauseUnlock(): DictionaryValue<PauseUnlock> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storePauseUnlock(src)).endCell());
        },
        parse: (src) => {
            return loadPauseUnlock(src.loadRef().beginParse());
        }
    }
}

export type BuyTokens = {
    $$type: 'BuyTokens';
    tonAmount: bigint;
    taiAmount: bigint;
    beneficiary: Address;
}

export function storeBuyTokens(src: BuyTokens) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1294606507, 32);
        b_0.storeInt(src.tonAmount, 257);
        b_0.storeInt(src.taiAmount, 257);
        b_0.storeAddress(src.beneficiary);
    };
}

export function loadBuyTokens(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1294606507) { throw Error('Invalid prefix'); }
    const _tonAmount = sc_0.loadIntBig(257);
    const _taiAmount = sc_0.loadIntBig(257);
    const _beneficiary = sc_0.loadAddress();
    return { $$type: 'BuyTokens' as const, tonAmount: _tonAmount, taiAmount: _taiAmount, beneficiary: _beneficiary };
}

export function loadTupleBuyTokens(source: TupleReader) {
    const _tonAmount = source.readBigNumber();
    const _taiAmount = source.readBigNumber();
    const _beneficiary = source.readAddress();
    return { $$type: 'BuyTokens' as const, tonAmount: _tonAmount, taiAmount: _taiAmount, beneficiary: _beneficiary };
}

export function loadGetterTupleBuyTokens(source: TupleReader) {
    const _tonAmount = source.readBigNumber();
    const _taiAmount = source.readBigNumber();
    const _beneficiary = source.readAddress();
    return { $$type: 'BuyTokens' as const, tonAmount: _tonAmount, taiAmount: _taiAmount, beneficiary: _beneficiary };
}

export function storeTupleBuyTokens(source: BuyTokens) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.tonAmount);
    builder.writeNumber(source.taiAmount);
    builder.writeAddress(source.beneficiary);
    return builder.build();
}

export function dictValueParserBuyTokens(): DictionaryValue<BuyTokens> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBuyTokens(src)).endCell());
        },
        parse: (src) => {
            return loadBuyTokens(src.loadRef().beginParse());
        }
    }
}

export type ClaimFission = {
    $$type: 'ClaimFission';
    recipient: Address;
    amount: bigint;
}

export function storeClaimFission(src: ClaimFission) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(18720429, 32);
        b_0.storeAddress(src.recipient);
        b_0.storeInt(src.amount, 257);
    };
}

export function loadClaimFission(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 18720429) { throw Error('Invalid prefix'); }
    const _recipient = sc_0.loadAddress();
    const _amount = sc_0.loadIntBig(257);
    return { $$type: 'ClaimFission' as const, recipient: _recipient, amount: _amount };
}

export function loadTupleClaimFission(source: TupleReader) {
    const _recipient = source.readAddress();
    const _amount = source.readBigNumber();
    return { $$type: 'ClaimFission' as const, recipient: _recipient, amount: _amount };
}

export function loadGetterTupleClaimFission(source: TupleReader) {
    const _recipient = source.readAddress();
    const _amount = source.readBigNumber();
    return { $$type: 'ClaimFission' as const, recipient: _recipient, amount: _amount };
}

export function storeTupleClaimFission(source: ClaimFission) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.recipient);
    builder.writeNumber(source.amount);
    return builder.build();
}

export function dictValueParserClaimFission(): DictionaryValue<ClaimFission> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeClaimFission(src)).endCell());
        },
        parse: (src) => {
            return loadClaimFission(src.loadRef().beginParse());
        }
    }
}

export type RefundSaleRemainder = {
    $$type: 'RefundSaleRemainder';
}

export function storeRefundSaleRemainder(src: RefundSaleRemainder) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3981117921, 32);
    };
}

export function loadRefundSaleRemainder(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3981117921) { throw Error('Invalid prefix'); }
    return { $$type: 'RefundSaleRemainder' as const };
}

export function loadTupleRefundSaleRemainder(source: TupleReader) {
    return { $$type: 'RefundSaleRemainder' as const };
}

export function loadGetterTupleRefundSaleRemainder(source: TupleReader) {
    return { $$type: 'RefundSaleRemainder' as const };
}

export function storeTupleRefundSaleRemainder(source: RefundSaleRemainder) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserRefundSaleRemainder(): DictionaryValue<RefundSaleRemainder> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRefundSaleRemainder(src)).endCell());
        },
        parse: (src) => {
            return loadRefundSaleRemainder(src.loadRef().beginParse());
        }
    }
}

export type StartWhitelistSale = {
    $$type: 'StartWhitelistSale';
    merkleRoot: Cell;
    totalAmount: bigint;
    baselinePrice: bigint;
    currentPrice: bigint;
    windowSeconds: bigint;
}

export function storeStartWhitelistSale(src: StartWhitelistSale) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1773594179, 32);
        b_0.storeRef(src.merkleRoot);
        b_0.storeInt(src.totalAmount, 257);
        b_0.storeInt(src.baselinePrice, 257);
        b_0.storeInt(src.currentPrice, 257);
        const b_1 = new Builder();
        b_1.storeInt(src.windowSeconds, 257);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadStartWhitelistSale(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1773594179) { throw Error('Invalid prefix'); }
    const _merkleRoot = sc_0.loadRef();
    const _totalAmount = sc_0.loadIntBig(257);
    const _baselinePrice = sc_0.loadIntBig(257);
    const _currentPrice = sc_0.loadIntBig(257);
    const sc_1 = sc_0.loadRef().beginParse();
    const _windowSeconds = sc_1.loadIntBig(257);
    return { $$type: 'StartWhitelistSale' as const, merkleRoot: _merkleRoot, totalAmount: _totalAmount, baselinePrice: _baselinePrice, currentPrice: _currentPrice, windowSeconds: _windowSeconds };
}

export function loadTupleStartWhitelistSale(source: TupleReader) {
    const _merkleRoot = source.readCell();
    const _totalAmount = source.readBigNumber();
    const _baselinePrice = source.readBigNumber();
    const _currentPrice = source.readBigNumber();
    const _windowSeconds = source.readBigNumber();
    return { $$type: 'StartWhitelistSale' as const, merkleRoot: _merkleRoot, totalAmount: _totalAmount, baselinePrice: _baselinePrice, currentPrice: _currentPrice, windowSeconds: _windowSeconds };
}

export function loadGetterTupleStartWhitelistSale(source: TupleReader) {
    const _merkleRoot = source.readCell();
    const _totalAmount = source.readBigNumber();
    const _baselinePrice = source.readBigNumber();
    const _currentPrice = source.readBigNumber();
    const _windowSeconds = source.readBigNumber();
    return { $$type: 'StartWhitelistSale' as const, merkleRoot: _merkleRoot, totalAmount: _totalAmount, baselinePrice: _baselinePrice, currentPrice: _currentPrice, windowSeconds: _windowSeconds };
}

export function storeTupleStartWhitelistSale(source: StartWhitelistSale) {
    const builder = new TupleBuilder();
    builder.writeCell(source.merkleRoot);
    builder.writeNumber(source.totalAmount);
    builder.writeNumber(source.baselinePrice);
    builder.writeNumber(source.currentPrice);
    builder.writeNumber(source.windowSeconds);
    return builder.build();
}

export function dictValueParserStartWhitelistSale(): DictionaryValue<StartWhitelistSale> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStartWhitelistSale(src)).endCell());
        },
        parse: (src) => {
            return loadStartWhitelistSale(src.loadRef().beginParse());
        }
    }
}

export type CancelWhitelistSale = {
    $$type: 'CancelWhitelistSale';
}

export function storeCancelWhitelistSale(src: CancelWhitelistSale) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1380739122, 32);
    };
}

export function loadCancelWhitelistSale(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1380739122) { throw Error('Invalid prefix'); }
    return { $$type: 'CancelWhitelistSale' as const };
}

export function loadTupleCancelWhitelistSale(source: TupleReader) {
    return { $$type: 'CancelWhitelistSale' as const };
}

export function loadGetterTupleCancelWhitelistSale(source: TupleReader) {
    return { $$type: 'CancelWhitelistSale' as const };
}

export function storeTupleCancelWhitelistSale(source: CancelWhitelistSale) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserCancelWhitelistSale(): DictionaryValue<CancelWhitelistSale> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCancelWhitelistSale(src)).endCell());
        },
        parse: (src) => {
            return loadCancelWhitelistSale(src.loadRef().beginParse());
        }
    }
}

export type PurchaseWhitelist = {
    $$type: 'PurchaseWhitelist';
    amount: bigint;
    quota: bigint;
    proof: Cell | null;
    beneficiary: Address;
}

export function storePurchaseWhitelist(src: PurchaseWhitelist) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2162821518, 32);
        b_0.storeInt(src.amount, 257);
        b_0.storeInt(src.quota, 257);
        if (src.proof !== null && src.proof !== undefined) { b_0.storeBit(true).storeRef(src.proof); } else { b_0.storeBit(false); }
        b_0.storeAddress(src.beneficiary);
    };
}

export function loadPurchaseWhitelist(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2162821518) { throw Error('Invalid prefix'); }
    const _amount = sc_0.loadIntBig(257);
    const _quota = sc_0.loadIntBig(257);
    const _proof = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _beneficiary = sc_0.loadAddress();
    return { $$type: 'PurchaseWhitelist' as const, amount: _amount, quota: _quota, proof: _proof, beneficiary: _beneficiary };
}

export function loadTuplePurchaseWhitelist(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _quota = source.readBigNumber();
    const _proof = source.readCellOpt();
    const _beneficiary = source.readAddress();
    return { $$type: 'PurchaseWhitelist' as const, amount: _amount, quota: _quota, proof: _proof, beneficiary: _beneficiary };
}

export function loadGetterTuplePurchaseWhitelist(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _quota = source.readBigNumber();
    const _proof = source.readCellOpt();
    const _beneficiary = source.readAddress();
    return { $$type: 'PurchaseWhitelist' as const, amount: _amount, quota: _quota, proof: _proof, beneficiary: _beneficiary };
}

export function storeTuplePurchaseWhitelist(source: PurchaseWhitelist) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    builder.writeNumber(source.quota);
    builder.writeCell(source.proof);
    builder.writeAddress(source.beneficiary);
    return builder.build();
}

export function dictValueParserPurchaseWhitelist(): DictionaryValue<PurchaseWhitelist> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storePurchaseWhitelist(src)).endCell());
        },
        parse: (src) => {
            return loadPurchaseWhitelist(src.loadRef().beginParse());
        }
    }
}

export type CloseWhitelistSale = {
    $$type: 'CloseWhitelistSale';
}

export function storeCloseWhitelistSale(src: CloseWhitelistSale) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3164457204, 32);
    };
}

export function loadCloseWhitelistSale(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3164457204) { throw Error('Invalid prefix'); }
    return { $$type: 'CloseWhitelistSale' as const };
}

export function loadTupleCloseWhitelistSale(source: TupleReader) {
    return { $$type: 'CloseWhitelistSale' as const };
}

export function loadGetterTupleCloseWhitelistSale(source: TupleReader) {
    return { $$type: 'CloseWhitelistSale' as const };
}

export function storeTupleCloseWhitelistSale(source: CloseWhitelistSale) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserCloseWhitelistSale(): DictionaryValue<CloseWhitelistSale> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCloseWhitelistSale(src)).endCell());
        },
        parse: (src) => {
            return loadCloseWhitelistSale(src.loadRef().beginParse());
        }
    }
}

export type TriggerEmergencyBuyback = {
    $$type: 'TriggerEmergencyBuyback';
    priceNow: bigint;
    pricePrev: bigint;
}

export function storeTriggerEmergencyBuyback(src: TriggerEmergencyBuyback) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2652668014, 32);
        b_0.storeInt(src.priceNow, 257);
        b_0.storeInt(src.pricePrev, 257);
    };
}

export function loadTriggerEmergencyBuyback(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2652668014) { throw Error('Invalid prefix'); }
    const _priceNow = sc_0.loadIntBig(257);
    const _pricePrev = sc_0.loadIntBig(257);
    return { $$type: 'TriggerEmergencyBuyback' as const, priceNow: _priceNow, pricePrev: _pricePrev };
}

export function loadTupleTriggerEmergencyBuyback(source: TupleReader) {
    const _priceNow = source.readBigNumber();
    const _pricePrev = source.readBigNumber();
    return { $$type: 'TriggerEmergencyBuyback' as const, priceNow: _priceNow, pricePrev: _pricePrev };
}

export function loadGetterTupleTriggerEmergencyBuyback(source: TupleReader) {
    const _priceNow = source.readBigNumber();
    const _pricePrev = source.readBigNumber();
    return { $$type: 'TriggerEmergencyBuyback' as const, priceNow: _priceNow, pricePrev: _pricePrev };
}

export function storeTupleTriggerEmergencyBuyback(source: TriggerEmergencyBuyback) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.priceNow);
    builder.writeNumber(source.pricePrev);
    return builder.build();
}

export function dictValueParserTriggerEmergencyBuyback(): DictionaryValue<TriggerEmergencyBuyback> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTriggerEmergencyBuyback(src)).endCell());
        },
        parse: (src) => {
            return loadTriggerEmergencyBuyback(src.loadRef().beginParse());
        }
    }
}

export type PriceRecord = {
    $$type: 'PriceRecord';
    price: bigint;
    timestamp: bigint;
    round: bigint;
}

export function storePriceRecord(src: PriceRecord) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.price, 257);
        b_0.storeInt(src.timestamp, 257);
        b_0.storeInt(src.round, 257);
    };
}

export function loadPriceRecord(slice: Slice) {
    const sc_0 = slice;
    const _price = sc_0.loadIntBig(257);
    const _timestamp = sc_0.loadIntBig(257);
    const _round = sc_0.loadIntBig(257);
    return { $$type: 'PriceRecord' as const, price: _price, timestamp: _timestamp, round: _round };
}

export function loadTuplePriceRecord(source: TupleReader) {
    const _price = source.readBigNumber();
    const _timestamp = source.readBigNumber();
    const _round = source.readBigNumber();
    return { $$type: 'PriceRecord' as const, price: _price, timestamp: _timestamp, round: _round };
}

export function loadGetterTuplePriceRecord(source: TupleReader) {
    const _price = source.readBigNumber();
    const _timestamp = source.readBigNumber();
    const _round = source.readBigNumber();
    return { $$type: 'PriceRecord' as const, price: _price, timestamp: _timestamp, round: _round };
}

export function storeTuplePriceRecord(source: PriceRecord) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.price);
    builder.writeNumber(source.timestamp);
    builder.writeNumber(source.round);
    return builder.build();
}

export function dictValueParserPriceRecord(): DictionaryValue<PriceRecord> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storePriceRecord(src)).endCell());
        },
        parse: (src) => {
            return loadPriceRecord(src.loadRef().beginParse());
        }
    }
}

export type SaleInfo = {
    $$type: 'SaleInfo';
    remaining: bigint;
    sold: bigint;
    endTimestamp: bigint;
    closed: boolean;
}

export function storeSaleInfo(src: SaleInfo) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.remaining, 257);
        b_0.storeInt(src.sold, 257);
        b_0.storeInt(src.endTimestamp, 257);
        b_0.storeBit(src.closed);
    };
}

export function loadSaleInfo(slice: Slice) {
    const sc_0 = slice;
    const _remaining = sc_0.loadIntBig(257);
    const _sold = sc_0.loadIntBig(257);
    const _endTimestamp = sc_0.loadIntBig(257);
    const _closed = sc_0.loadBit();
    return { $$type: 'SaleInfo' as const, remaining: _remaining, sold: _sold, endTimestamp: _endTimestamp, closed: _closed };
}

export function loadTupleSaleInfo(source: TupleReader) {
    const _remaining = source.readBigNumber();
    const _sold = source.readBigNumber();
    const _endTimestamp = source.readBigNumber();
    const _closed = source.readBoolean();
    return { $$type: 'SaleInfo' as const, remaining: _remaining, sold: _sold, endTimestamp: _endTimestamp, closed: _closed };
}

export function loadGetterTupleSaleInfo(source: TupleReader) {
    const _remaining = source.readBigNumber();
    const _sold = source.readBigNumber();
    const _endTimestamp = source.readBigNumber();
    const _closed = source.readBoolean();
    return { $$type: 'SaleInfo' as const, remaining: _remaining, sold: _sold, endTimestamp: _endTimestamp, closed: _closed };
}

export function storeTupleSaleInfo(source: SaleInfo) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.remaining);
    builder.writeNumber(source.sold);
    builder.writeNumber(source.endTimestamp);
    builder.writeBoolean(source.closed);
    return builder.build();
}

export function dictValueParserSaleInfo(): DictionaryValue<SaleInfo> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSaleInfo(src)).endCell());
        },
        parse: (src) => {
            return loadSaleInfo(src.loadRef().beginParse());
        }
    }
}

export type UnlockStatus = {
    $$type: 'UnlockStatus';
    currentRound: bigint;
    remainingLocked: bigint;
    lastPrice: bigint;
    paused: boolean;
}

export function storeUnlockStatus(src: UnlockStatus) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.currentRound, 257);
        b_0.storeInt(src.remainingLocked, 257);
        b_0.storeInt(src.lastPrice, 257);
        b_0.storeBit(src.paused);
    };
}

export function loadUnlockStatus(slice: Slice) {
    const sc_0 = slice;
    const _currentRound = sc_0.loadIntBig(257);
    const _remainingLocked = sc_0.loadIntBig(257);
    const _lastPrice = sc_0.loadIntBig(257);
    const _paused = sc_0.loadBit();
    return { $$type: 'UnlockStatus' as const, currentRound: _currentRound, remainingLocked: _remainingLocked, lastPrice: _lastPrice, paused: _paused };
}

export function loadTupleUnlockStatus(source: TupleReader) {
    const _currentRound = source.readBigNumber();
    const _remainingLocked = source.readBigNumber();
    const _lastPrice = source.readBigNumber();
    const _paused = source.readBoolean();
    return { $$type: 'UnlockStatus' as const, currentRound: _currentRound, remainingLocked: _remainingLocked, lastPrice: _lastPrice, paused: _paused };
}

export function loadGetterTupleUnlockStatus(source: TupleReader) {
    const _currentRound = source.readBigNumber();
    const _remainingLocked = source.readBigNumber();
    const _lastPrice = source.readBigNumber();
    const _paused = source.readBoolean();
    return { $$type: 'UnlockStatus' as const, currentRound: _currentRound, remainingLocked: _remainingLocked, lastPrice: _lastPrice, paused: _paused };
}

export function storeTupleUnlockStatus(source: UnlockStatus) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.currentRound);
    builder.writeNumber(source.remainingLocked);
    builder.writeNumber(source.lastPrice);
    builder.writeBoolean(source.paused);
    return builder.build();
}

export function dictValueParserUnlockStatus(): DictionaryValue<UnlockStatus> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUnlockStatus(src)).endCell());
        },
        parse: (src) => {
            return loadUnlockStatus(src.loadRef().beginParse());
        }
    }
}

export type SupplySummary = {
    $$type: 'SupplySummary';
    total: bigint;
    locked: bigint;
    circulating: bigint;
}

export function storeSupplySummary(src: SupplySummary) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.total, 257);
        b_0.storeInt(src.locked, 257);
        b_0.storeInt(src.circulating, 257);
    };
}

export function loadSupplySummary(slice: Slice) {
    const sc_0 = slice;
    const _total = sc_0.loadIntBig(257);
    const _locked = sc_0.loadIntBig(257);
    const _circulating = sc_0.loadIntBig(257);
    return { $$type: 'SupplySummary' as const, total: _total, locked: _locked, circulating: _circulating };
}

export function loadTupleSupplySummary(source: TupleReader) {
    const _total = source.readBigNumber();
    const _locked = source.readBigNumber();
    const _circulating = source.readBigNumber();
    return { $$type: 'SupplySummary' as const, total: _total, locked: _locked, circulating: _circulating };
}

export function loadGetterTupleSupplySummary(source: TupleReader) {
    const _total = source.readBigNumber();
    const _locked = source.readBigNumber();
    const _circulating = source.readBigNumber();
    return { $$type: 'SupplySummary' as const, total: _total, locked: _locked, circulating: _circulating };
}

export function storeTupleSupplySummary(source: SupplySummary) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.total);
    builder.writeNumber(source.locked);
    builder.writeNumber(source.circulating);
    return builder.build();
}

export function dictValueParserSupplySummary(): DictionaryValue<SupplySummary> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSupplySummary(src)).endCell());
        },
        parse: (src) => {
            return loadSupplySummary(src.loadRef().beginParse());
        }
    }
}

export type WhitelistSaleInfo = {
    $$type: 'WhitelistSaleInfo';
    active: boolean;
    total: bigint;
    sold: bigint;
    remaining: bigint;
    baselinePrice: bigint;
    currentPrice: bigint;
    windowEnd: bigint;
}

export function storeWhitelistSaleInfo(src: WhitelistSaleInfo) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBit(src.active);
        b_0.storeInt(src.total, 257);
        b_0.storeInt(src.sold, 257);
        b_0.storeInt(src.remaining, 257);
        const b_1 = new Builder();
        b_1.storeInt(src.baselinePrice, 257);
        b_1.storeInt(src.currentPrice, 257);
        b_1.storeInt(src.windowEnd, 257);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadWhitelistSaleInfo(slice: Slice) {
    const sc_0 = slice;
    const _active = sc_0.loadBit();
    const _total = sc_0.loadIntBig(257);
    const _sold = sc_0.loadIntBig(257);
    const _remaining = sc_0.loadIntBig(257);
    const sc_1 = sc_0.loadRef().beginParse();
    const _baselinePrice = sc_1.loadIntBig(257);
    const _currentPrice = sc_1.loadIntBig(257);
    const _windowEnd = sc_1.loadIntBig(257);
    return { $$type: 'WhitelistSaleInfo' as const, active: _active, total: _total, sold: _sold, remaining: _remaining, baselinePrice: _baselinePrice, currentPrice: _currentPrice, windowEnd: _windowEnd };
}

export function loadTupleWhitelistSaleInfo(source: TupleReader) {
    const _active = source.readBoolean();
    const _total = source.readBigNumber();
    const _sold = source.readBigNumber();
    const _remaining = source.readBigNumber();
    const _baselinePrice = source.readBigNumber();
    const _currentPrice = source.readBigNumber();
    const _windowEnd = source.readBigNumber();
    return { $$type: 'WhitelistSaleInfo' as const, active: _active, total: _total, sold: _sold, remaining: _remaining, baselinePrice: _baselinePrice, currentPrice: _currentPrice, windowEnd: _windowEnd };
}

export function loadGetterTupleWhitelistSaleInfo(source: TupleReader) {
    const _active = source.readBoolean();
    const _total = source.readBigNumber();
    const _sold = source.readBigNumber();
    const _remaining = source.readBigNumber();
    const _baselinePrice = source.readBigNumber();
    const _currentPrice = source.readBigNumber();
    const _windowEnd = source.readBigNumber();
    return { $$type: 'WhitelistSaleInfo' as const, active: _active, total: _total, sold: _sold, remaining: _remaining, baselinePrice: _baselinePrice, currentPrice: _currentPrice, windowEnd: _windowEnd };
}

export function storeTupleWhitelistSaleInfo(source: WhitelistSaleInfo) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.active);
    builder.writeNumber(source.total);
    builder.writeNumber(source.sold);
    builder.writeNumber(source.remaining);
    builder.writeNumber(source.baselinePrice);
    builder.writeNumber(source.currentPrice);
    builder.writeNumber(source.windowEnd);
    return builder.build();
}

export function dictValueParserWhitelistSaleInfo(): DictionaryValue<WhitelistSaleInfo> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeWhitelistSaleInfo(src)).endCell());
        },
        parse: (src) => {
            return loadWhitelistSaleInfo(src.loadRef().beginParse());
        }
    }
}

export type WhitelistSale = {
    $$type: 'WhitelistSale';
    active: boolean;
    merkleRoot: Cell | null;
    totalAmount: bigint;
    soldAmount: bigint;
    baselinePrice: bigint;
    currentPrice: bigint;
    windowEnd: bigint;
}

export function storeWhitelistSale(src: WhitelistSale) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBit(src.active);
        if (src.merkleRoot !== null && src.merkleRoot !== undefined) { b_0.storeBit(true).storeRef(src.merkleRoot); } else { b_0.storeBit(false); }
        b_0.storeInt(src.totalAmount, 257);
        b_0.storeInt(src.soldAmount, 257);
        b_0.storeInt(src.baselinePrice, 257);
        const b_1 = new Builder();
        b_1.storeInt(src.currentPrice, 257);
        b_1.storeInt(src.windowEnd, 257);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadWhitelistSale(slice: Slice) {
    const sc_0 = slice;
    const _active = sc_0.loadBit();
    const _merkleRoot = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _totalAmount = sc_0.loadIntBig(257);
    const _soldAmount = sc_0.loadIntBig(257);
    const _baselinePrice = sc_0.loadIntBig(257);
    const sc_1 = sc_0.loadRef().beginParse();
    const _currentPrice = sc_1.loadIntBig(257);
    const _windowEnd = sc_1.loadIntBig(257);
    return { $$type: 'WhitelistSale' as const, active: _active, merkleRoot: _merkleRoot, totalAmount: _totalAmount, soldAmount: _soldAmount, baselinePrice: _baselinePrice, currentPrice: _currentPrice, windowEnd: _windowEnd };
}

export function loadTupleWhitelistSale(source: TupleReader) {
    const _active = source.readBoolean();
    const _merkleRoot = source.readCellOpt();
    const _totalAmount = source.readBigNumber();
    const _soldAmount = source.readBigNumber();
    const _baselinePrice = source.readBigNumber();
    const _currentPrice = source.readBigNumber();
    const _windowEnd = source.readBigNumber();
    return { $$type: 'WhitelistSale' as const, active: _active, merkleRoot: _merkleRoot, totalAmount: _totalAmount, soldAmount: _soldAmount, baselinePrice: _baselinePrice, currentPrice: _currentPrice, windowEnd: _windowEnd };
}

export function loadGetterTupleWhitelistSale(source: TupleReader) {
    const _active = source.readBoolean();
    const _merkleRoot = source.readCellOpt();
    const _totalAmount = source.readBigNumber();
    const _soldAmount = source.readBigNumber();
    const _baselinePrice = source.readBigNumber();
    const _currentPrice = source.readBigNumber();
    const _windowEnd = source.readBigNumber();
    return { $$type: 'WhitelistSale' as const, active: _active, merkleRoot: _merkleRoot, totalAmount: _totalAmount, soldAmount: _soldAmount, baselinePrice: _baselinePrice, currentPrice: _currentPrice, windowEnd: _windowEnd };
}

export function storeTupleWhitelistSale(source: WhitelistSale) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.active);
    builder.writeCell(source.merkleRoot);
    builder.writeNumber(source.totalAmount);
    builder.writeNumber(source.soldAmount);
    builder.writeNumber(source.baselinePrice);
    builder.writeNumber(source.currentPrice);
    builder.writeNumber(source.windowEnd);
    return builder.build();
}

export function dictValueParserWhitelistSale(): DictionaryValue<WhitelistSale> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeWhitelistSale(src)).endCell());
        },
        parse: (src) => {
            return loadWhitelistSale(src.loadRef().beginParse());
        }
    }
}

export type TAIUnlockController$Data = {
    $$type: 'TAIUnlockController$Data';
    admin: Address;
    treasury: Address;
    saleEndTimestamp: bigint;
    balances: Dictionary<Address, bigint>;
    whitelistUsage: Dictionary<Address, bigint>;
    remainingSaleSupply: bigint;
    totalSaleSold: bigint;
    saleClosed: boolean;
    remainingLocked: bigint;
    currentRound: bigint;
    paused: boolean;
    initialPriceSet: boolean;
    lastRoundPrice: bigint;
    lastRoundTimestamp: bigint;
    lastRoundId: bigint;
    pendingPrice: PriceRecord | null;
    usdcMaster: Address;
    whitelistSale: WhitelistSale;
    reserveUsdc: bigint;
    reserveUsdt: bigint;
}

export function storeTAIUnlockController$Data(src: TAIUnlockController$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.admin);
        b_0.storeAddress(src.treasury);
        b_0.storeInt(src.saleEndTimestamp, 257);
        b_0.storeDict(src.balances, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
        b_0.storeDict(src.whitelistUsage, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
        const b_1 = new Builder();
        b_1.storeInt(src.remainingSaleSupply, 257);
        b_1.storeInt(src.totalSaleSold, 257);
        b_1.storeBit(src.saleClosed);
        b_1.storeInt(src.remainingLocked, 257);
        const b_2 = new Builder();
        b_2.storeInt(src.currentRound, 257);
        b_2.storeBit(src.paused);
        b_2.storeBit(src.initialPriceSet);
        b_2.storeInt(src.lastRoundPrice, 257);
        b_2.storeInt(src.lastRoundTimestamp, 257);
        const b_3 = new Builder();
        b_3.storeInt(src.lastRoundId, 257);
        const b_4 = new Builder();
        if (src.pendingPrice !== null && src.pendingPrice !== undefined) { b_4.storeBit(true); b_4.store(storePriceRecord(src.pendingPrice)); } else { b_4.storeBit(false); }
        const b_5 = new Builder();
        b_5.storeAddress(src.usdcMaster);
        const b_6 = new Builder();
        b_6.store(storeWhitelistSale(src.whitelistSale));
        const b_7 = new Builder();
        b_7.storeInt(src.reserveUsdc, 257);
        b_7.storeInt(src.reserveUsdt, 257);
        b_6.storeRef(b_7.endCell());
        b_5.storeRef(b_6.endCell());
        b_4.storeRef(b_5.endCell());
        b_3.storeRef(b_4.endCell());
        b_2.storeRef(b_3.endCell());
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadTAIUnlockController$Data(slice: Slice) {
    const sc_0 = slice;
    const _admin = sc_0.loadAddress();
    const _treasury = sc_0.loadAddress();
    const _saleEndTimestamp = sc_0.loadIntBig(257);
    const _balances = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_0);
    const _whitelistUsage = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_0);
    const sc_1 = sc_0.loadRef().beginParse();
    const _remainingSaleSupply = sc_1.loadIntBig(257);
    const _totalSaleSold = sc_1.loadIntBig(257);
    const _saleClosed = sc_1.loadBit();
    const _remainingLocked = sc_1.loadIntBig(257);
    const sc_2 = sc_1.loadRef().beginParse();
    const _currentRound = sc_2.loadIntBig(257);
    const _paused = sc_2.loadBit();
    const _initialPriceSet = sc_2.loadBit();
    const _lastRoundPrice = sc_2.loadIntBig(257);
    const _lastRoundTimestamp = sc_2.loadIntBig(257);
    const sc_3 = sc_2.loadRef().beginParse();
    const _lastRoundId = sc_3.loadIntBig(257);
    const sc_4 = sc_3.loadRef().beginParse();
    const _pendingPrice = sc_4.loadBit() ? loadPriceRecord(sc_4) : null;
    const sc_5 = sc_4.loadRef().beginParse();
    const _usdcMaster = sc_5.loadAddress();
    const sc_6 = sc_5.loadRef().beginParse();
    const _whitelistSale = loadWhitelistSale(sc_6);
    const sc_7 = sc_6.loadRef().beginParse();
    const _reserveUsdc = sc_7.loadIntBig(257);
    const _reserveUsdt = sc_7.loadIntBig(257);
    return { $$type: 'TAIUnlockController$Data' as const, admin: _admin, treasury: _treasury, saleEndTimestamp: _saleEndTimestamp, balances: _balances, whitelistUsage: _whitelistUsage, remainingSaleSupply: _remainingSaleSupply, totalSaleSold: _totalSaleSold, saleClosed: _saleClosed, remainingLocked: _remainingLocked, currentRound: _currentRound, paused: _paused, initialPriceSet: _initialPriceSet, lastRoundPrice: _lastRoundPrice, lastRoundTimestamp: _lastRoundTimestamp, lastRoundId: _lastRoundId, pendingPrice: _pendingPrice, usdcMaster: _usdcMaster, whitelistSale: _whitelistSale, reserveUsdc: _reserveUsdc, reserveUsdt: _reserveUsdt };
}

export function loadTupleTAIUnlockController$Data(source: TupleReader) {
    const _admin = source.readAddress();
    const _treasury = source.readAddress();
    const _saleEndTimestamp = source.readBigNumber();
    const _balances = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _whitelistUsage = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _remainingSaleSupply = source.readBigNumber();
    const _totalSaleSold = source.readBigNumber();
    const _saleClosed = source.readBoolean();
    const _remainingLocked = source.readBigNumber();
    const _currentRound = source.readBigNumber();
    const _paused = source.readBoolean();
    const _initialPriceSet = source.readBoolean();
    const _lastRoundPrice = source.readBigNumber();
    const _lastRoundTimestamp = source.readBigNumber();
    source = source.readTuple();
    const _lastRoundId = source.readBigNumber();
    const _pendingPrice_p = source.readTupleOpt();
    const _pendingPrice = _pendingPrice_p ? loadTuplePriceRecord(_pendingPrice_p) : null;
    const _usdcMaster = source.readAddress();
    const _whitelistSale = loadTupleWhitelistSale(source);
    const _reserveUsdc = source.readBigNumber();
    const _reserveUsdt = source.readBigNumber();
    return { $$type: 'TAIUnlockController$Data' as const, admin: _admin, treasury: _treasury, saleEndTimestamp: _saleEndTimestamp, balances: _balances, whitelistUsage: _whitelistUsage, remainingSaleSupply: _remainingSaleSupply, totalSaleSold: _totalSaleSold, saleClosed: _saleClosed, remainingLocked: _remainingLocked, currentRound: _currentRound, paused: _paused, initialPriceSet: _initialPriceSet, lastRoundPrice: _lastRoundPrice, lastRoundTimestamp: _lastRoundTimestamp, lastRoundId: _lastRoundId, pendingPrice: _pendingPrice, usdcMaster: _usdcMaster, whitelistSale: _whitelistSale, reserveUsdc: _reserveUsdc, reserveUsdt: _reserveUsdt };
}

export function loadGetterTupleTAIUnlockController$Data(source: TupleReader) {
    const _admin = source.readAddress();
    const _treasury = source.readAddress();
    const _saleEndTimestamp = source.readBigNumber();
    const _balances = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _whitelistUsage = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _remainingSaleSupply = source.readBigNumber();
    const _totalSaleSold = source.readBigNumber();
    const _saleClosed = source.readBoolean();
    const _remainingLocked = source.readBigNumber();
    const _currentRound = source.readBigNumber();
    const _paused = source.readBoolean();
    const _initialPriceSet = source.readBoolean();
    const _lastRoundPrice = source.readBigNumber();
    const _lastRoundTimestamp = source.readBigNumber();
    const _lastRoundId = source.readBigNumber();
    const _pendingPrice_p = source.readTupleOpt();
    const _pendingPrice = _pendingPrice_p ? loadTuplePriceRecord(_pendingPrice_p) : null;
    const _usdcMaster = source.readAddress();
    const _whitelistSale = loadGetterTupleWhitelistSale(source);
    const _reserveUsdc = source.readBigNumber();
    const _reserveUsdt = source.readBigNumber();
    return { $$type: 'TAIUnlockController$Data' as const, admin: _admin, treasury: _treasury, saleEndTimestamp: _saleEndTimestamp, balances: _balances, whitelistUsage: _whitelistUsage, remainingSaleSupply: _remainingSaleSupply, totalSaleSold: _totalSaleSold, saleClosed: _saleClosed, remainingLocked: _remainingLocked, currentRound: _currentRound, paused: _paused, initialPriceSet: _initialPriceSet, lastRoundPrice: _lastRoundPrice, lastRoundTimestamp: _lastRoundTimestamp, lastRoundId: _lastRoundId, pendingPrice: _pendingPrice, usdcMaster: _usdcMaster, whitelistSale: _whitelistSale, reserveUsdc: _reserveUsdc, reserveUsdt: _reserveUsdt };
}

export function storeTupleTAIUnlockController$Data(source: TAIUnlockController$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.admin);
    builder.writeAddress(source.treasury);
    builder.writeNumber(source.saleEndTimestamp);
    builder.writeCell(source.balances.size > 0 ? beginCell().storeDictDirect(source.balances, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.whitelistUsage.size > 0 ? beginCell().storeDictDirect(source.whitelistUsage, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeNumber(source.remainingSaleSupply);
    builder.writeNumber(source.totalSaleSold);
    builder.writeBoolean(source.saleClosed);
    builder.writeNumber(source.remainingLocked);
    builder.writeNumber(source.currentRound);
    builder.writeBoolean(source.paused);
    builder.writeBoolean(source.initialPriceSet);
    builder.writeNumber(source.lastRoundPrice);
    builder.writeNumber(source.lastRoundTimestamp);
    builder.writeNumber(source.lastRoundId);
    if (source.pendingPrice !== null && source.pendingPrice !== undefined) {
        builder.writeTuple(storeTuplePriceRecord(source.pendingPrice));
    } else {
        builder.writeTuple(null);
    }
    builder.writeAddress(source.usdcMaster);
    builder.writeTuple(storeTupleWhitelistSale(source.whitelistSale));
    builder.writeNumber(source.reserveUsdc);
    builder.writeNumber(source.reserveUsdt);
    return builder.build();
}

export function dictValueParserTAIUnlockController$Data(): DictionaryValue<TAIUnlockController$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTAIUnlockController$Data(src)).endCell());
        },
        parse: (src) => {
            return loadTAIUnlockController$Data(src.loadRef().beginParse());
        }
    }
}

 type TAIUnlockController_init_args = {
    $$type: 'TAIUnlockController_init_args';
    admin: Address;
    treasury: Address;
    saleEndTimestamp: bigint;
    usdcMaster: Address;
}

function initTAIUnlockController_init_args(src: TAIUnlockController_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.admin);
        b_0.storeAddress(src.treasury);
        b_0.storeInt(src.saleEndTimestamp, 257);
        const b_1 = new Builder();
        b_1.storeAddress(src.usdcMaster);
        b_0.storeRef(b_1.endCell());
    };
}

async function TAIUnlockController_init(admin: Address, treasury: Address, saleEndTimestamp: bigint, usdcMaster: Address) {
    const __code = Cell.fromHex('b5ee9c7241025201001876000228ff008e88f4a413f4bcf2c80bed5320e303ed43d9011a02016202030105a000593b0201200411020120050b020158060904dbb1313b513434800063b036cf15c68446044644460445c4460445c4458445c4458445444584454445044544450444c4450444c4448444c44484444444844444440444444403c44403d543a3a63e903e9020404075c03500743e900c0510cc01345540b6cf38b6cf15c417c3db28601b1d070800022a002c206e92306d99206ef2d0806f236f03e2206e92306dde03d7b30dbb513434800063b036cf15c68446044644460445c4460445c4458445c4458445444584454445044544450444c4450444c4448444c44484444444844444440444444403c44403d543a3a63e903e9020404075c03500743e900c0510cc01345540b6cf38b6cf1b311b39201b1d0a001056145614561956150201200c0e03d7b7061da89a1a400031d81b678ae34223022322230222e2230222e222c222e222c222a222c222a2228222a22282226222822262224222622242222222422222220222222201e22201eaa1d1d31f481f481020203ae01a803a1f4806028866009a2aa05b679c5b678d9ced98f01b1d0d00245365a120c100923070de546980546881538703fbb7527da89a1a400031d81b678ae34223022322230222e2230222e222c222e222c222a222c222a2228222a22282226222822262224222622242222222422222220222222201e22201eaa1d1d31f481f481020203ae01a803a1f4806028866009a2aa05b679c4223222342232223022322230222e2230222e222c222e222d01b1d0f01641115111611151114111511141113111411131112111311121111111211111110111111100f11100f550edb3c57105f0f6ca1100104db3c4a020120121403d7ba53fed44d0d200018ec0db3c571a1118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550e8e98fa40fa40810101d700d401d0fa403014433004d15502db3ce2db3c6cf36cb381b1d130130f828db3c8218174876e80001a18218174876e800015613014a020158151803fbb061fb513434800063b036cf15c68446044644460445c4460445c4458445c4458445444584454445044544450444c4450444c4448444c44484444444844444440444444403c44403d543a3a63e903e9020404075c03500743e900c0510cc01345540b6cf388446444684464446044644460445c4460445c4458445c445a01b1d1601641115111611151114111511141113111411131112111311121111111211111110111111100f11100f550edb3c57105f0f6ca1170104db3c4203d7b389bb513434800063b036cf15c68446044644460445c4460445c4458445c4458445444584454445044544450444c4450444c4448444c44484444444844444440444444403c44403d543a3a63e903e9020404075c03500743e900c0510cc01345540b6cf38b6cf1b311b39201b1d19000e561056122f561203f63001d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018ec0db3c571a1118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550e8e98fa40fa40810101d700d401d0fa403014433004d15502db3ce21b1d1f01ccfa40fa40810101d700f404d401d0f404810101d700810101d700d200810101d700d430d0810101d700d200d200810101d700810101d700d430d0810101d700d430d0d200018e13810101d700810101d700810101d70055206f03916de201d430d0fa40d430d01c00bcd200f404810101d700810101d700810101d700d401d0810101d700810101d700301027102610251024102307d430d0810101d700810101d700301116111a111611161119111611161118111611161117111610781067105610451034102301f6816626f8235230bcf2f4226d6df8281281010b01821816d1415400810101216e955b59f4593098c801cf004133f441e281010b5806821077359400810101216e955b59f4593098c801cf004133f441e28211dcd650007070821814f46b04007170705475556d706d547333530053881115111811151114111611141e00501113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a047e111b945f0f5f0ce070561ad74920c21f9731111ad31f111bde218210e6259d19bae302218210bcca4ab6bae302218210892bd199bae302218210b931b732ba2021222601fa5b3a3a3a1116810101d700810101d700308200b35df8425618c705f2f4820090460cb31cf2f48200831d21c200f2f48119c1f82352c0bef2f41115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd717f4dbe108a1079106810571046103544344d01e85b391118810101d700810101d700810101d700308200831d23c200f2f48161f42ff2f48111d1532dbef2f46f031117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b0a107955164d01fc5b57198161f42df2f48116032eb3f2f42ea481664421c114f2f482008efe561182112a05f200bef2f42981642c216eb3f2f4206ef2d0806f238200ca532f82015180a05230bef2f41119111b11191118111a11181117111b11171116111a11161115111b11151114111a11141113111b11131112111a11121111111b11112302fe1110111a11100f111b0f0e111a0e0d111b0d0c111a0c0b111b0b0a111a0a09111b0908111a0807111b0706111a0605111b0504111a0403111b0302111a0201111c01111d561bdb3c3b3b3b3e5617a76408a6641ba807813b7508be17f2f40c82112a05f200a16df8281116111a111682112a05f2005616111b1116111a11162425005a20c2019320c1089170e293308064e020c2079320c10e9170e293308050e020c20d92c114923070e2928032e07002dc111511191115111411181114111311171113111211161112111111151111041114041112111311120e11120e0d11110d0d11100d0f104e103d108c107b106a1059103810571036055044db3cc87f01ca00111a111911181117111611151114111311121111111055e0db3cc9ed54474f04fe8ee25b3e1118d200308200b35df8425619c705f2f41117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e0f10ce10bd10ac109b108a107910681057104610354430e02182104d2a20abbae3022182091da6adbae302218210ed4b09e14d27292b01f85b1119810101d700810101d700fa4030813e955614b3f2f4814aa0f823561ab9f2f4812a6122c200f2f4817ddb23c200f2f482008be7225617bbf2f4817766f8416f24135f035004be13f2f411145614a111135614a0f828111a111c111a1119111b11191118111a11181117111911171116111811161114111711142802cc011116011113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a1079106810571046400305db3c5614937f5713dfc87f01ca00111a111911181117111611151114111311121111111055e0db3cc9ed54474f01fa5b1119fa40810101d700308200b35df842561bc705f2f4812a6121c200f2f4813e955613b3f2f482008be7215616bbf2f411145614a111135614a0f828111a111c111a1119111b11191118111a1118111711191117111611181116111411171114011116011113111511131112111411121111111311111110111211102a02940f11110f0e11100e10df10ce10bd10ac109b108a1079106810571046400305db3c5614937f5713dfc87f01ca00111a111911181117111611151114111311121111111055e0db3cc9ed54474f03f6ba8f765b57198200c4ad5611b3f2f48200aaf7f8235617be917f945613c000e2f2f4561220c200953057105711e30d1115111711151114111611141113111511131112111411121111111311117011131110111211107f11120f11110f0e11100e10df10ce10bd10ac109b108a107910681057104610354413e0212c4d2e02f6f8281119111b11195618111b1118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a10791068105710461035044133db3c57125713111011171110111211161112111011151110472d00301112111411121110111311101110111111100111100155d1044a821069b6e643bae302218210524c6832bae302218210bc9dc8f4bae30221821080ea098eba2f31333501f610285f081113d4810101d700810101d700810101d700d430d0810101d700308200b35df8425618c705f2f4813e3a06b316f2f48200befb23c200f2f48172ae22c200f2f48171f625c200f2f4248203f480bc958203f48035de7f70f8235007a016433011171119111711161118111611151117111511141116111430018c1113111511131112111411121111111311111110111211100f11110f0e11100e10df551cc87f01ca00111a111911181117111611151114111311121111111055e0db3cc9ed544f02fa5b57198200b35df8425619c705f2f4268ede1117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df551cc87f01ca00111a111911181117111611151114111311121111111055e0db3cc9ed54e11117111911171116111811164f3202aa1115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df551c70db3cc87f01ca00111a111911181117111611151114111311121111111055e0db3cc9ed54464f02fc5b5719268ede1117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df551cc87f01ca00111a111911181117111611151114111311121111111055e0db3cc9ed54e1812a05f82322be917f96f8425619c705e2f2f41117111911174f3402b61116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df551c7fdb3cc87f01ca00111a111911181117111611151114111311121111111055e0db3cc9ed54464f02fe8efb5b1119810101d700810101d700f404fa4030811e7f2bf2f4812b5bf82326bbf2f4812a6124c200f2f4810b5b23c200f2f4298132d2216eb3f2f4206ef2d080f842820097875113c705f2f41119111c11191118111b11181117111a11171116111c11161115111b11151114111a11141113111c11131112111b1112e021364c02f41111111a11111110111c11100f111b0f0e111a0e0d111c0d0c111b0c0b111a0b0a111c0a09111b0908111a0807111c0706111b0605111a0504111c0403111b0302111a0201111d01111e561d561cdb3c111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511143738001030c85202cf1630c902fc1113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a108910781067105610451034413001111f018200e1b91120db3c01111e01f2f4111811191118111711181117111611171116111511161115111411151114111311141113111211131112111111121111111011111110394101f0111b111c111b111a111c111a1119111c11191118111c11181117111c11171116111c11161115111c11151114111c11141113111c11131112111c11121111111c11111110111c11100f111c0f0e111c0e0d111c0d0c111c0c0b111c0b0a111c0a09111c0908111c0807111c0706111c0605111c0504111c043a01de03111c0302111c02db3cf900111bf90001111b01ba1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a10891078106710561045103441303b02bc206e9130e0206ef2d080d0d300d4f4043002e30f111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550ef02c3c3e01f8111b111c111b111a111c111a1119111c11191118111c11181117111c11171116111c11161115111c11151114111c11141113111c11131112111c11121111111c11111110111c11100f111c0f0e111c0e0d111c0d0c111c0c0b111c0b0a111c0a09111c0908111c0807111c0706111c0605111c0504111c0403111c033d011402111c0201111c01db3c4001f8111b111c111b111a111c111a1119111c11191118111c11181117111c11171116111c11161115111c11151114111c11141113111c11131112111c11121111111c11111110111c11100f111c0f0e111c0e0d111c0d0c111c0c0b111c0b0a111c0a09111c0908111c0807111c0706111c0605111c0504111c0403111c033f011202111c0201111cdb3c400012c85122cc3021cc30c902f80f11100f550e111c561bdb3c814afc21561da001111fbb01111e01f2f4817e8b26561ca028bbf2f481010b111d561ba00211160201111d01561c01810101216e955b59f4593098c801cf004133f441e2045619a0111811191118111711181117111611171116111511161115041115041113111411131112111311124243004681010b5617028101014133f40a6fa19401d70030925b6de2206e923070e0206ef2d08002fa1111111211111110111111100f11100f10ef10de10cd10bc10ab109a108910781067055163051034413001111c0120111ddb3c12a0f828111a111c111a1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f44450012a8821005f5e100a90403940e11100e10df10ce10bd10ac109b108a10791068105710461035403304db3c5356be8e837fdb3cdec87f01ca00111a111911181117111611151114111311121111111055e0db3cc9ed5447464f0168935356b99170e28e9a5365a120c2008e8bf828561a58db3c50785f07953050785f07e29450785f07e2706d7054700020106855154701f28200c47721c200f2f41119111c11191118111b11181117111a11171116111c11161115111b11151114111a11141113111c11131112111b11121111111a11111110111c11100f111b0f0e111a0e0d111c0d0c111b0c0b111a0b0a111c0a09111b0908111a0807111c0706111b0605111a0504111c0403111b034802fc02111a0201111c01111b561adb3c8169b021561ebef2f481010b01561da1031118031201111c01810101216e955b59f4593098c801cf004133f441e2111811191118111711181117111611171114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a108910784a4902fe10671056104510344130561bdb3c81010b111ca00311170302111b0201111c01810101216e955b59f4593098c801cf004133f441e211171119111711161118111611151117111511161113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a107910681057104610354a4b004681010b5618028101014133f40a6fa19401d70030925b6de2206e923070e0206ef2d0800004440302fc82109e1c806eba8ef25b1119810101d700810101d700308200b35df842561bc705f2f48200831d21c200f2f48200831d22c200f2f401aa0081099b02bbf2f41117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df551ce0571b4d4e0144c87f01ca00111a111911181117111611151114111311121111111055e0db3cc9ed544f01e6c000111ac12101111a01b08ede1117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df551cc87f01ca00111a111911181117111611151114111311121111111055e0db3cc9ed54e05f0f5f0bf2c0824f02e001111901111ace01111701ce01111501810101cf0001111301f4001111c8f40001111001810101cf001e810101cf001cca001a810101cf0008c8810101cf0017ca0015ca0013810101cf00810101cf0001c8810101cf00c8236eb39633705003ca00e30d03c8cec80705104810394bcd5051003e7f01ca0003206ef2d0806f2310355023810101cf00810101cf00810101cf00007e5067ca0014f40012810101cf00810101cf00810101cf0001c8810101cf0012810101cf00cd07c8810101cf0018810101cf0016cd13cd15cd13cd13cd12cdcd80e99b9a');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initTAIUnlockController_init_args({ $$type: 'TAIUnlockController_init_args', admin, treasury, saleEndTimestamp, usdcMaster })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const TAIUnlockController_errors = {
    2: { message: "Stack underflow" },
    3: { message: "Stack overflow" },
    4: { message: "Integer overflow" },
    5: { message: "Integer out of expected range" },
    6: { message: "Invalid opcode" },
    7: { message: "Type check error" },
    8: { message: "Cell overflow" },
    9: { message: "Cell underflow" },
    10: { message: "Dictionary error" },
    11: { message: "'Unknown' error" },
    12: { message: "Fatal error" },
    13: { message: "Out of gas error" },
    14: { message: "Virtualization error" },
    32: { message: "Action list is invalid" },
    33: { message: "Action list is too long" },
    34: { message: "Action is invalid or not supported" },
    35: { message: "Invalid source address in outbound message" },
    36: { message: "Invalid destination address in outbound message" },
    37: { message: "Not enough Toncoin" },
    38: { message: "Not enough extra currencies" },
    39: { message: "Outbound message does not fit into a cell after rewriting" },
    40: { message: "Cannot process a message" },
    41: { message: "Library reference is null" },
    42: { message: "Library change action error" },
    43: { message: "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree" },
    50: { message: "Account state size exceeded limits" },
    128: { message: "Null reference exception" },
    129: { message: "Invalid serialization prefix" },
    130: { message: "Invalid incoming message" },
    131: { message: "Constraints error" },
    132: { message: "Access denied" },
    133: { message: "Contract stopped" },
    134: { message: "Invalid argument" },
    135: { message: "Code of a contract was not found" },
    136: { message: "Invalid standard address" },
    138: { message: "Not a basechain address" },
    2459: { message: "DROP_NOT_MET" },
    2907: { message: "INVALID_QUOTA" },
    4561: { message: "PRICE_TIME_REWIND" },
    5635: { message: "UNLOCK_PAUSED" },
    6593: { message: "INVALID_TIME" },
    7807: { message: "WL_INACTIVE" },
    10757: { message: "WINDOW_ACTIVE" },
    10849: { message: "INVALID_AMOUNT" },
    11099: { message: "WINDOW_CLOSED" },
    13010: { message: "NO_ROOT" },
    15221: { message: "INFLATION_NOT_MET" },
    15930: { message: "SALE_ACTIVE" },
    16021: { message: "SALE_CLOSED" },
    19104: { message: "SALE_ENDED" },
    19196: { message: "QUOTA_EXCEEDED" },
    25076: { message: "PRICE_NOT_INITIALIZED" },
    25644: { message: "PRICE_MISSING" },
    26150: { message: "SALE_END_PAST" },
    26180: { message: "ROUND_LIMIT" },
    27056: { message: "INSUFFICIENT_FUNDS" },
    29174: { message: "INVALID_WINDOW" },
    29358: { message: "INVALID_BASELINE" },
    30566: { message: "TON_UNDERPAID" },
    32219: { message: "INVALID_TON" },
    32395: { message: "WL_SOLD_OUT" },
    33565: { message: "INVALID_PRICE" },
    35815: { message: "INSUFFICIENT_SALE" },
    36606: { message: "NO_LOCKED_LIQ" },
    36934: { message: "PRICE_ALREADY_SET" },
    38791: { message: "SENDER_MISMATCH" },
    43767: { message: "SALE_STILL_ACTIVE" },
    45917: { message: "NOT_ADMIN" },
    48891: { message: "INVALID_TOTAL" },
    50295: { message: "INVALID_TRANSFER" },
    50349: { message: "SALE_ALREADY_CLOSED" },
    51795: { message: "HOLD_NOT_MET" },
    57785: { message: "INVALID_PROOF" },
} as const

export const TAIUnlockController_errors_backward = {
    "Stack underflow": 2,
    "Stack overflow": 3,
    "Integer overflow": 4,
    "Integer out of expected range": 5,
    "Invalid opcode": 6,
    "Type check error": 7,
    "Cell overflow": 8,
    "Cell underflow": 9,
    "Dictionary error": 10,
    "'Unknown' error": 11,
    "Fatal error": 12,
    "Out of gas error": 13,
    "Virtualization error": 14,
    "Action list is invalid": 32,
    "Action list is too long": 33,
    "Action is invalid or not supported": 34,
    "Invalid source address in outbound message": 35,
    "Invalid destination address in outbound message": 36,
    "Not enough Toncoin": 37,
    "Not enough extra currencies": 38,
    "Outbound message does not fit into a cell after rewriting": 39,
    "Cannot process a message": 40,
    "Library reference is null": 41,
    "Library change action error": 42,
    "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree": 43,
    "Account state size exceeded limits": 50,
    "Null reference exception": 128,
    "Invalid serialization prefix": 129,
    "Invalid incoming message": 130,
    "Constraints error": 131,
    "Access denied": 132,
    "Contract stopped": 133,
    "Invalid argument": 134,
    "Code of a contract was not found": 135,
    "Invalid standard address": 136,
    "Not a basechain address": 138,
    "DROP_NOT_MET": 2459,
    "INVALID_QUOTA": 2907,
    "PRICE_TIME_REWIND": 4561,
    "UNLOCK_PAUSED": 5635,
    "INVALID_TIME": 6593,
    "WL_INACTIVE": 7807,
    "WINDOW_ACTIVE": 10757,
    "INVALID_AMOUNT": 10849,
    "WINDOW_CLOSED": 11099,
    "NO_ROOT": 13010,
    "INFLATION_NOT_MET": 15221,
    "SALE_ACTIVE": 15930,
    "SALE_CLOSED": 16021,
    "SALE_ENDED": 19104,
    "QUOTA_EXCEEDED": 19196,
    "PRICE_NOT_INITIALIZED": 25076,
    "PRICE_MISSING": 25644,
    "SALE_END_PAST": 26150,
    "ROUND_LIMIT": 26180,
    "INSUFFICIENT_FUNDS": 27056,
    "INVALID_WINDOW": 29174,
    "INVALID_BASELINE": 29358,
    "TON_UNDERPAID": 30566,
    "INVALID_TON": 32219,
    "WL_SOLD_OUT": 32395,
    "INVALID_PRICE": 33565,
    "INSUFFICIENT_SALE": 35815,
    "NO_LOCKED_LIQ": 36606,
    "PRICE_ALREADY_SET": 36934,
    "SENDER_MISMATCH": 38791,
    "SALE_STILL_ACTIVE": 43767,
    "NOT_ADMIN": 45917,
    "INVALID_TOTAL": 48891,
    "INVALID_TRANSFER": 50295,
    "SALE_ALREADY_CLOSED": 50349,
    "HOLD_NOT_MET": 51795,
    "INVALID_PROOF": 57785,
} as const

const TAIUnlockController_types: ABIType[] = [
    {"name":"DataSize","header":null,"fields":[{"name":"cells","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bits","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"refs","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"SignedBundle","header":null,"fields":[{"name":"signature","type":{"kind":"simple","type":"fixed-bytes","optional":false,"format":64}},{"name":"signedData","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Context","header":null,"fields":[{"name":"bounceable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"raw","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"SendParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"code","type":{"kind":"simple","type":"cell","optional":true}},{"name":"data","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"MessageParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"DeployParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}},{"name":"init","type":{"kind":"simple","type":"StateInit","optional":false}}]},
    {"name":"StdAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":8}},{"name":"address","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"VarAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":32}},{"name":"address","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"BasechainAddress","header":null,"fields":[{"name":"hash","type":{"kind":"simple","type":"int","optional":true,"format":257}}]},
    {"name":"SetInitialPrice","header":3861224729,"fields":[{"name":"price","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"timestamp","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"RecordPrice","header":3167374006,"fields":[{"name":"price","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"timestamp","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"round","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"UnlockRound","header":2301350297,"fields":[]},
    {"name":"PauseUnlock","header":3107043122,"fields":[{"name":"value","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"BuyTokens","header":1294606507,"fields":[{"name":"tonAmount","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"taiAmount","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"beneficiary","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ClaimFission","header":18720429,"fields":[{"name":"recipient","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"RefundSaleRemainder","header":3981117921,"fields":[]},
    {"name":"StartWhitelistSale","header":1773594179,"fields":[{"name":"merkleRoot","type":{"kind":"simple","type":"cell","optional":false}},{"name":"totalAmount","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"baselinePrice","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"currentPrice","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"windowSeconds","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"CancelWhitelistSale","header":1380739122,"fields":[]},
    {"name":"PurchaseWhitelist","header":2162821518,"fields":[{"name":"amount","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"quota","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"proof","type":{"kind":"simple","type":"cell","optional":true}},{"name":"beneficiary","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"CloseWhitelistSale","header":3164457204,"fields":[]},
    {"name":"TriggerEmergencyBuyback","header":2652668014,"fields":[{"name":"priceNow","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"pricePrev","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"PriceRecord","header":null,"fields":[{"name":"price","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"timestamp","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"round","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"SaleInfo","header":null,"fields":[{"name":"remaining","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"sold","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"endTimestamp","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"closed","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"UnlockStatus","header":null,"fields":[{"name":"currentRound","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"remainingLocked","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"lastPrice","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"paused","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"SupplySummary","header":null,"fields":[{"name":"total","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"locked","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"circulating","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"WhitelistSaleInfo","header":null,"fields":[{"name":"active","type":{"kind":"simple","type":"bool","optional":false}},{"name":"total","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"sold","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"remaining","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"baselinePrice","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"currentPrice","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"windowEnd","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"WhitelistSale","header":null,"fields":[{"name":"active","type":{"kind":"simple","type":"bool","optional":false}},{"name":"merkleRoot","type":{"kind":"simple","type":"cell","optional":true}},{"name":"totalAmount","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"soldAmount","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"baselinePrice","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"currentPrice","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"windowEnd","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"TAIUnlockController$Data","header":null,"fields":[{"name":"admin","type":{"kind":"simple","type":"address","optional":false}},{"name":"treasury","type":{"kind":"simple","type":"address","optional":false}},{"name":"saleEndTimestamp","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"balances","type":{"kind":"dict","key":"address","value":"int"}},{"name":"whitelistUsage","type":{"kind":"dict","key":"address","value":"int"}},{"name":"remainingSaleSupply","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"totalSaleSold","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"saleClosed","type":{"kind":"simple","type":"bool","optional":false}},{"name":"remainingLocked","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"currentRound","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"paused","type":{"kind":"simple","type":"bool","optional":false}},{"name":"initialPriceSet","type":{"kind":"simple","type":"bool","optional":false}},{"name":"lastRoundPrice","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"lastRoundTimestamp","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"lastRoundId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"pendingPrice","type":{"kind":"simple","type":"PriceRecord","optional":true}},{"name":"usdcMaster","type":{"kind":"simple","type":"address","optional":false}},{"name":"whitelistSale","type":{"kind":"simple","type":"WhitelistSale","optional":false}},{"name":"reserveUsdc","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"reserveUsdt","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
]

const TAIUnlockController_opcodes = {
    "SetInitialPrice": 3861224729,
    "RecordPrice": 3167374006,
    "UnlockRound": 2301350297,
    "PauseUnlock": 3107043122,
    "BuyTokens": 1294606507,
    "ClaimFission": 18720429,
    "RefundSaleRemainder": 3981117921,
    "StartWhitelistSale": 1773594179,
    "CancelWhitelistSale": 1380739122,
    "PurchaseWhitelist": 2162821518,
    "CloseWhitelistSale": 3164457204,
    "TriggerEmergencyBuyback": 2652668014,
}

const TAIUnlockController_getters: ABIGetter[] = [
    {"name":"saleInfo","methodId":80950,"arguments":[],"returnType":{"kind":"simple","type":"SaleInfo","optional":false}},
    {"name":"unlockStatus","methodId":130598,"arguments":[],"returnType":{"kind":"simple","type":"UnlockStatus","optional":false}},
    {"name":"lastRecordedPrice","methodId":74948,"arguments":[],"returnType":{"kind":"simple","type":"PriceRecord","optional":true}},
    {"name":"supplySummary","methodId":107839,"arguments":[],"returnType":{"kind":"simple","type":"SupplySummary","optional":false}},
    {"name":"balanceOf","methodId":96915,"arguments":[{"name":"target","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"whitelistSaleInfo","methodId":88112,"arguments":[],"returnType":{"kind":"simple","type":"WhitelistSaleInfo","optional":false}},
    {"name":"whitelistUsed","methodId":123271,"arguments":[{"name":"target","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
]

export const TAIUnlockController_getterMapping: { [key: string]: string } = {
    'saleInfo': 'getSaleInfo',
    'unlockStatus': 'getUnlockStatus',
    'lastRecordedPrice': 'getLastRecordedPrice',
    'supplySummary': 'getSupplySummary',
    'balanceOf': 'getBalanceOf',
    'whitelistSaleInfo': 'getWhitelistSaleInfo',
    'whitelistUsed': 'getWhitelistUsed',
}

const TAIUnlockController_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"empty"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetInitialPrice"}},
    {"receiver":"internal","message":{"kind":"typed","type":"RecordPrice"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UnlockRound"}},
    {"receiver":"internal","message":{"kind":"typed","type":"PauseUnlock"}},
    {"receiver":"internal","message":{"kind":"typed","type":"BuyTokens"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ClaimFission"}},
    {"receiver":"internal","message":{"kind":"typed","type":"RefundSaleRemainder"}},
    {"receiver":"internal","message":{"kind":"typed","type":"StartWhitelistSale"}},
    {"receiver":"internal","message":{"kind":"typed","type":"CancelWhitelistSale"}},
    {"receiver":"internal","message":{"kind":"typed","type":"CloseWhitelistSale"}},
    {"receiver":"internal","message":{"kind":"typed","type":"PurchaseWhitelist"}},
    {"receiver":"internal","message":{"kind":"typed","type":"TriggerEmergencyBuyback"}},
]

export const TOTAL_SUPPLY = 100000000000n;
export const SALE_SUPPLY = 8000000000n;
export const MARKETING_ALLOCATION = 2000000000n;
export const LOCKED_SUPPLY = 90000000000n;
export const TOTAL_ROUNDS = 19n;
export const MAX_UNLOCK_ROUND = 19n;
export const UNLOCK_PER_ROUND = 5000000000n;
export const PRICE_PRECISION = 100000000n;
export const MIN_PRICE = 1n;
export const REQUIRED_HOLD_SECONDS = 86400n;
export const WHITELIST_WINDOW_SECONDS = 259200n;

export class TAIUnlockController implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = TAIUnlockController_errors_backward;
    public static readonly opcodes = TAIUnlockController_opcodes;
    
    static async init(admin: Address, treasury: Address, saleEndTimestamp: bigint, usdcMaster: Address) {
        return await TAIUnlockController_init(admin, treasury, saleEndTimestamp, usdcMaster);
    }
    
    static async fromInit(admin: Address, treasury: Address, saleEndTimestamp: bigint, usdcMaster: Address) {
        const __gen_init = await TAIUnlockController_init(admin, treasury, saleEndTimestamp, usdcMaster);
        const address = contractAddress(0, __gen_init);
        return new TAIUnlockController(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new TAIUnlockController(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  TAIUnlockController_types,
        getters: TAIUnlockController_getters,
        receivers: TAIUnlockController_receivers,
        errors: TAIUnlockController_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: null | SetInitialPrice | RecordPrice | UnlockRound | PauseUnlock | BuyTokens | ClaimFission | RefundSaleRemainder | StartWhitelistSale | CancelWhitelistSale | CloseWhitelistSale | PurchaseWhitelist | TriggerEmergencyBuyback) {
        
        let body: Cell | null = null;
        if (message === null) {
            body = new Cell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetInitialPrice') {
            body = beginCell().store(storeSetInitialPrice(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'RecordPrice') {
            body = beginCell().store(storeRecordPrice(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UnlockRound') {
            body = beginCell().store(storeUnlockRound(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'PauseUnlock') {
            body = beginCell().store(storePauseUnlock(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'BuyTokens') {
            body = beginCell().store(storeBuyTokens(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ClaimFission') {
            body = beginCell().store(storeClaimFission(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'RefundSaleRemainder') {
            body = beginCell().store(storeRefundSaleRemainder(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'StartWhitelistSale') {
            body = beginCell().store(storeStartWhitelistSale(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'CancelWhitelistSale') {
            body = beginCell().store(storeCancelWhitelistSale(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'CloseWhitelistSale') {
            body = beginCell().store(storeCloseWhitelistSale(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'PurchaseWhitelist') {
            body = beginCell().store(storePurchaseWhitelist(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'TriggerEmergencyBuyback') {
            body = beginCell().store(storeTriggerEmergencyBuyback(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getSaleInfo(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('saleInfo', builder.build())).stack;
        const result = loadGetterTupleSaleInfo(source);
        return result;
    }
    
    async getUnlockStatus(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('unlockStatus', builder.build())).stack;
        const result = loadGetterTupleUnlockStatus(source);
        return result;
    }
    
    async getLastRecordedPrice(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('lastRecordedPrice', builder.build())).stack;
        const result_p = source.readTupleOpt();
        const result = result_p ? loadTuplePriceRecord(result_p) : null;
        return result;
    }
    
    async getSupplySummary(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('supplySummary', builder.build())).stack;
        const result = loadGetterTupleSupplySummary(source);
        return result;
    }
    
    async getBalanceOf(provider: ContractProvider, target: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(target);
        const source = (await provider.get('balanceOf', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getWhitelistSaleInfo(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('whitelistSaleInfo', builder.build())).stack;
        const result = loadGetterTupleWhitelistSaleInfo(source);
        return result;
    }
    
    async getWhitelistUsed(provider: ContractProvider, target: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(target);
        const source = (await provider.get('whitelistUsed', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
}