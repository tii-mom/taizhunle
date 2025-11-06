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

export type PushPrice = {
    $$type: 'PushPrice';
    timestamp: bigint;
    price: bigint;
}

export function storePushPrice(src: PushPrice) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(4090136517, 32);
        b_0.storeInt(src.timestamp, 257);
        b_0.storeInt(src.price, 257);
    };
}

export function loadPushPrice(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 4090136517) { throw Error('Invalid prefix'); }
    const _timestamp = sc_0.loadIntBig(257);
    const _price = sc_0.loadIntBig(257);
    return { $$type: 'PushPrice' as const, timestamp: _timestamp, price: _price };
}

export function loadTuplePushPrice(source: TupleReader) {
    const _timestamp = source.readBigNumber();
    const _price = source.readBigNumber();
    return { $$type: 'PushPrice' as const, timestamp: _timestamp, price: _price };
}

export function loadGetterTuplePushPrice(source: TupleReader) {
    const _timestamp = source.readBigNumber();
    const _price = source.readBigNumber();
    return { $$type: 'PushPrice' as const, timestamp: _timestamp, price: _price };
}

export function storeTuplePushPrice(source: PushPrice) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.timestamp);
    builder.writeNumber(source.price);
    return builder.build();
}

export function dictValueParserPushPrice(): DictionaryValue<PushPrice> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storePushPrice(src)).endCell());
        },
        parse: (src) => {
            return loadPushPrice(src.loadRef().beginParse());
        }
    }
}

export type BatchPushPrice = {
    $$type: 'BatchPushPrice';
    entries: Cell | null;
}

export function storeBatchPushPrice(src: BatchPushPrice) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2712739837, 32);
        if (src.entries !== null && src.entries !== undefined) { b_0.storeBit(true).storeRef(src.entries); } else { b_0.storeBit(false); }
    };
}

export function loadBatchPushPrice(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2712739837) { throw Error('Invalid prefix'); }
    const _entries = sc_0.loadBit() ? sc_0.loadRef() : null;
    return { $$type: 'BatchPushPrice' as const, entries: _entries };
}

export function loadTupleBatchPushPrice(source: TupleReader) {
    const _entries = source.readCellOpt();
    return { $$type: 'BatchPushPrice' as const, entries: _entries };
}

export function loadGetterTupleBatchPushPrice(source: TupleReader) {
    const _entries = source.readCellOpt();
    return { $$type: 'BatchPushPrice' as const, entries: _entries };
}

export function storeTupleBatchPushPrice(source: BatchPushPrice) {
    const builder = new TupleBuilder();
    builder.writeCell(source.entries);
    return builder.build();
}

export function dictValueParserBatchPushPrice(): DictionaryValue<BatchPushPrice> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBatchPushPrice(src)).endCell());
        },
        parse: (src) => {
            return loadBatchPushPrice(src.loadRef().beginParse());
        }
    }
}

export type ResetPrice = {
    $$type: 'ResetPrice';
    timestamp: bigint;
    price: bigint;
}

export function storeResetPrice(src: ResetPrice) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1312950905, 32);
        b_0.storeInt(src.timestamp, 257);
        b_0.storeInt(src.price, 257);
    };
}

export function loadResetPrice(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1312950905) { throw Error('Invalid prefix'); }
    const _timestamp = sc_0.loadIntBig(257);
    const _price = sc_0.loadIntBig(257);
    return { $$type: 'ResetPrice' as const, timestamp: _timestamp, price: _price };
}

export function loadTupleResetPrice(source: TupleReader) {
    const _timestamp = source.readBigNumber();
    const _price = source.readBigNumber();
    return { $$type: 'ResetPrice' as const, timestamp: _timestamp, price: _price };
}

export function loadGetterTupleResetPrice(source: TupleReader) {
    const _timestamp = source.readBigNumber();
    const _price = source.readBigNumber();
    return { $$type: 'ResetPrice' as const, timestamp: _timestamp, price: _price };
}

export function storeTupleResetPrice(source: ResetPrice) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.timestamp);
    builder.writeNumber(source.price);
    return builder.build();
}

export function dictValueParserResetPrice(): DictionaryValue<ResetPrice> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeResetPrice(src)).endCell());
        },
        parse: (src) => {
            return loadResetPrice(src.loadRef().beginParse());
        }
    }
}

export type PriceEntry = {
    $$type: 'PriceEntry';
    timestamp: bigint;
    price: bigint;
}

export function storePriceEntry(src: PriceEntry) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.timestamp, 257);
        b_0.storeInt(src.price, 257);
    };
}

export function loadPriceEntry(slice: Slice) {
    const sc_0 = slice;
    const _timestamp = sc_0.loadIntBig(257);
    const _price = sc_0.loadIntBig(257);
    return { $$type: 'PriceEntry' as const, timestamp: _timestamp, price: _price };
}

export function loadTuplePriceEntry(source: TupleReader) {
    const _timestamp = source.readBigNumber();
    const _price = source.readBigNumber();
    return { $$type: 'PriceEntry' as const, timestamp: _timestamp, price: _price };
}

export function loadGetterTuplePriceEntry(source: TupleReader) {
    const _timestamp = source.readBigNumber();
    const _price = source.readBigNumber();
    return { $$type: 'PriceEntry' as const, timestamp: _timestamp, price: _price };
}

export function storeTuplePriceEntry(source: PriceEntry) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.timestamp);
    builder.writeNumber(source.price);
    return builder.build();
}

export function dictValueParserPriceEntry(): DictionaryValue<PriceEntry> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storePriceEntry(src)).endCell());
        },
        parse: (src) => {
            return loadPriceEntry(src.loadRef().beginParse());
        }
    }
}

export type AvgState = {
    $$type: 'AvgState';
    sum: bigint;
    count: bigint;
}

export function storeAvgState(src: AvgState) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.sum, 257);
        b_0.storeInt(src.count, 257);
    };
}

export function loadAvgState(slice: Slice) {
    const sc_0 = slice;
    const _sum = sc_0.loadIntBig(257);
    const _count = sc_0.loadIntBig(257);
    return { $$type: 'AvgState' as const, sum: _sum, count: _count };
}

export function loadTupleAvgState(source: TupleReader) {
    const _sum = source.readBigNumber();
    const _count = source.readBigNumber();
    return { $$type: 'AvgState' as const, sum: _sum, count: _count };
}

export function loadGetterTupleAvgState(source: TupleReader) {
    const _sum = source.readBigNumber();
    const _count = source.readBigNumber();
    return { $$type: 'AvgState' as const, sum: _sum, count: _count };
}

export function storeTupleAvgState(source: AvgState) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.sum);
    builder.writeNumber(source.count);
    return builder.build();
}

export function dictValueParserAvgState(): DictionaryValue<AvgState> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeAvgState(src)).endCell());
        },
        parse: (src) => {
            return loadAvgState(src.loadRef().beginParse());
        }
    }
}

export type TaiOracle$Data = {
    $$type: 'TaiOracle$Data';
    admin: Address;
    priceHistory: Dictionary<bigint, PriceEntry>;
    latestEntry: PriceEntry | null;
}

export function storeTaiOracle$Data(src: TaiOracle$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.admin);
        b_0.storeDict(src.priceHistory, Dictionary.Keys.BigInt(257), dictValueParserPriceEntry());
        if (src.latestEntry !== null && src.latestEntry !== undefined) { b_0.storeBit(true); b_0.store(storePriceEntry(src.latestEntry)); } else { b_0.storeBit(false); }
    };
}

export function loadTaiOracle$Data(slice: Slice) {
    const sc_0 = slice;
    const _admin = sc_0.loadAddress();
    const _priceHistory = Dictionary.load(Dictionary.Keys.BigInt(257), dictValueParserPriceEntry(), sc_0);
    const _latestEntry = sc_0.loadBit() ? loadPriceEntry(sc_0) : null;
    return { $$type: 'TaiOracle$Data' as const, admin: _admin, priceHistory: _priceHistory, latestEntry: _latestEntry };
}

export function loadTupleTaiOracle$Data(source: TupleReader) {
    const _admin = source.readAddress();
    const _priceHistory = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserPriceEntry(), source.readCellOpt());
    const _latestEntry_p = source.readTupleOpt();
    const _latestEntry = _latestEntry_p ? loadTuplePriceEntry(_latestEntry_p) : null;
    return { $$type: 'TaiOracle$Data' as const, admin: _admin, priceHistory: _priceHistory, latestEntry: _latestEntry };
}

export function loadGetterTupleTaiOracle$Data(source: TupleReader) {
    const _admin = source.readAddress();
    const _priceHistory = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserPriceEntry(), source.readCellOpt());
    const _latestEntry_p = source.readTupleOpt();
    const _latestEntry = _latestEntry_p ? loadTuplePriceEntry(_latestEntry_p) : null;
    return { $$type: 'TaiOracle$Data' as const, admin: _admin, priceHistory: _priceHistory, latestEntry: _latestEntry };
}

export function storeTupleTaiOracle$Data(source: TaiOracle$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.admin);
    builder.writeCell(source.priceHistory.size > 0 ? beginCell().storeDictDirect(source.priceHistory, Dictionary.Keys.BigInt(257), dictValueParserPriceEntry()).endCell() : null);
    if (source.latestEntry !== null && source.latestEntry !== undefined) {
        builder.writeTuple(storeTuplePriceEntry(source.latestEntry));
    } else {
        builder.writeTuple(null);
    }
    return builder.build();
}

export function dictValueParserTaiOracle$Data(): DictionaryValue<TaiOracle$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTaiOracle$Data(src)).endCell());
        },
        parse: (src) => {
            return loadTaiOracle$Data(src.loadRef().beginParse());
        }
    }
}

 type TaiOracle_init_args = {
    $$type: 'TaiOracle_init_args';
    admin: Address;
}

function initTaiOracle_init_args(src: TaiOracle_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.admin);
    };
}

async function TaiOracle_init(admin: Address) {
    const __code = Cell.fromHex('b5ee9c7241021a0100042100022cff008e88f4a413f4bcf2c80bed53208e8130e1ed43d9011302016202050202ca03040103aee00e0101d615020166061102012007090197b259bb513434800063873e903d013480006760404075c020404075c0165bc0a45b7890cc1b04e5fe900040745b5b789540b6cf1b0c481ba48c1b66481bbcb4201bc89bc0b8881ba48c1b77a008004c810101230259f40d6fa192306ddf206e92306d8e10d0810101d700810101d700596c126f02e20201200a0b016bae3af6a268690000c70e7d207a02690000cec08080eb80408080eb802cb78148b6f121983609cbfd200080e8b6b6f12a816d9e3618c00d016bacbbf6a268690000c70e7d207a02690000cec08080eb80408080eb802cb78148b6f121983609cbfd200080e8b6b6f12a896d9e3618c00c013e443473db3c20c10194306c2370e08127105006a014a8812710a90414be43300d016620c101923070e053116e925b70e0206ef2d0806f2220c101935f0370e00182015180a904702010241023db3c20925b70e1a9040e01b023c101926c32e0268101012659f40d6fa192306ddf206e92306d8e10d0810101d700810101d700596c126f02e2206eb38e9b206ef2d0806f223148765336db3c975086a006a406079136e250769130e204a503a50304f01b0f012a21a1144330db3c04810bb8a8812710a90414bb413010000c20c10091a3e00193b78e1da89a1a400031c39f481e809a400033b020203ae01020203ae00b2de0522dbc48660d8272ff4800203a2dadbc5b678d86240dd2460db3240dde5a100de44de05c440dd2460dbbd01200022004f601d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e1cfa40f404d200019d810101d700810101d700596f02916de243306c1397fa400101d16d6de204925f04e07023d74920c21f953103d31f04de218210f3ca87c5bae302218210a1b11ffdbae3022182104e420a79bae30234c00003c12116141619027c5b02f404305023db3c5502db3cc87f01ca0055205023cef400216eb38e177f01ca0001206ef2d0806f2202810101cf00810101cf00947032ca00e2c9ed5417150140206e9130e0206ef2d080d0810101d700810101d700f404305540db3c5502f02018028c5b02810101d700810101d700305034db3c4034db3cc87f01ca0055205023cef400216eb38e177f01ca0001206ef2d0806f2202810101cf00810101cf00947032ca00e2c9ed54171800168200b35df84224c705f2f400b88174be22c200f2f482008c1b21c200f2f4226eb38e138200b1a103206ef2d0806f22305220bc13f2f49132e22082015180a904028101015321c85902810101cf00810101cf00c910354140206e953059f45a30944133f415e2596f02007813b08e3202c87f01ca0055205023cef400216eb38e177f01ca0001206ef2d0806f2202810101cf00810101cf00947032ca00e2c9ed54e05f03f2c0824186630a');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initTaiOracle_init_args({ $$type: 'TaiOracle_init_args', admin })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const TaiOracle_errors = {
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
    29886: { message: "BAD_TS" },
    35867: { message: "BAD_PRICE" },
    45473: { message: "NON_MONOTONIC" },
    45917: { message: "NOT_ADMIN" },
} as const

export const TaiOracle_errors_backward = {
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
    "BAD_TS": 29886,
    "BAD_PRICE": 35867,
    "NON_MONOTONIC": 45473,
    "NOT_ADMIN": 45917,
} as const

const TaiOracle_types: ABIType[] = [
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
    {"name":"PushPrice","header":4090136517,"fields":[{"name":"timestamp","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"price","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"BatchPushPrice","header":2712739837,"fields":[{"name":"entries","type":{"kind":"simple","type":"cell","optional":true}}]},
    {"name":"ResetPrice","header":1312950905,"fields":[{"name":"timestamp","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"price","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"PriceEntry","header":null,"fields":[{"name":"timestamp","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"price","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"AvgState","header":null,"fields":[{"name":"sum","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"count","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"TaiOracle$Data","header":null,"fields":[{"name":"admin","type":{"kind":"simple","type":"address","optional":false}},{"name":"priceHistory","type":{"kind":"dict","key":"int","value":"PriceEntry","valueFormat":"ref"}},{"name":"latestEntry","type":{"kind":"simple","type":"PriceEntry","optional":true}}]},
]

const TaiOracle_opcodes = {
    "PushPrice": 4090136517,
    "BatchPushPrice": 2712739837,
    "ResetPrice": 1312950905,
}

const TaiOracle_getters: ABIGetter[] = [
    {"name":"latest","methodId":97392,"arguments":[],"returnType":{"kind":"simple","type":"PriceEntry","optional":true}},
    {"name":"priceAt","methodId":84326,"arguments":[{"name":"dayIndex","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"PriceEntry","optional":true}},
    {"name":"average","methodId":87157,"arguments":[{"name":"days","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"canUnlock","methodId":88439,"arguments":[{"name":"lastPrice","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"requiredBps","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"bool","optional":false}},
]

export const TaiOracle_getterMapping: { [key: string]: string } = {
    'latest': 'getLatest',
    'priceAt': 'getPriceAt',
    'average': 'getAverage',
    'canUnlock': 'getCanUnlock',
}

const TaiOracle_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"empty"}},
    {"receiver":"internal","message":{"kind":"typed","type":"PushPrice"}},
    {"receiver":"internal","message":{"kind":"typed","type":"BatchPushPrice"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ResetPrice"}},
]

export const MAX_DEVIATION_BPS = 3000n;
export const DAY_SECONDS = 86400n;

export class TaiOracle implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = TaiOracle_errors_backward;
    public static readonly opcodes = TaiOracle_opcodes;
    
    static async init(admin: Address) {
        return await TaiOracle_init(admin);
    }
    
    static async fromInit(admin: Address) {
        const __gen_init = await TaiOracle_init(admin);
        const address = contractAddress(0, __gen_init);
        return new TaiOracle(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new TaiOracle(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  TaiOracle_types,
        getters: TaiOracle_getters,
        receivers: TaiOracle_receivers,
        errors: TaiOracle_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: null | PushPrice | BatchPushPrice | ResetPrice) {
        
        let body: Cell | null = null;
        if (message === null) {
            body = new Cell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'PushPrice') {
            body = beginCell().store(storePushPrice(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'BatchPushPrice') {
            body = beginCell().store(storeBatchPushPrice(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ResetPrice') {
            body = beginCell().store(storeResetPrice(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getLatest(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('latest', builder.build())).stack;
        const result_p = source.readTupleOpt();
        const result = result_p ? loadTuplePriceEntry(result_p) : null;
        return result;
    }
    
    async getPriceAt(provider: ContractProvider, dayIndex: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(dayIndex);
        const source = (await provider.get('priceAt', builder.build())).stack;
        const result_p = source.readTupleOpt();
        const result = result_p ? loadTuplePriceEntry(result_p) : null;
        return result;
    }
    
    async getAverage(provider: ContractProvider, days: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(days);
        const source = (await provider.get('average', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getCanUnlock(provider: ContractProvider, lastPrice: bigint, requiredBps: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(lastPrice);
        builder.writeNumber(requiredBps);
        const source = (await provider.get('canUnlock', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
}