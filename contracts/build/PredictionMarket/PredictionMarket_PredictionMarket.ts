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

export type CreateMarket = {
    $$type: 'CreateMarket';
    closeTime: bigint;
    creatorStake: bigint;
    feeBps: bigint;
    metadata: Cell | null;
}

export function storeCreateMarket(src: CreateMarket) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2253082016, 32);
        b_0.storeInt(src.closeTime, 257);
        b_0.storeInt(src.creatorStake, 257);
        b_0.storeInt(src.feeBps, 257);
        if (src.metadata !== null && src.metadata !== undefined) { b_0.storeBit(true).storeRef(src.metadata); } else { b_0.storeBit(false); }
    };
}

export function loadCreateMarket(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2253082016) { throw Error('Invalid prefix'); }
    const _closeTime = sc_0.loadIntBig(257);
    const _creatorStake = sc_0.loadIntBig(257);
    const _feeBps = sc_0.loadIntBig(257);
    const _metadata = sc_0.loadBit() ? sc_0.loadRef() : null;
    return { $$type: 'CreateMarket' as const, closeTime: _closeTime, creatorStake: _creatorStake, feeBps: _feeBps, metadata: _metadata };
}

export function loadTupleCreateMarket(source: TupleReader) {
    const _closeTime = source.readBigNumber();
    const _creatorStake = source.readBigNumber();
    const _feeBps = source.readBigNumber();
    const _metadata = source.readCellOpt();
    return { $$type: 'CreateMarket' as const, closeTime: _closeTime, creatorStake: _creatorStake, feeBps: _feeBps, metadata: _metadata };
}

export function loadGetterTupleCreateMarket(source: TupleReader) {
    const _closeTime = source.readBigNumber();
    const _creatorStake = source.readBigNumber();
    const _feeBps = source.readBigNumber();
    const _metadata = source.readCellOpt();
    return { $$type: 'CreateMarket' as const, closeTime: _closeTime, creatorStake: _creatorStake, feeBps: _feeBps, metadata: _metadata };
}

export function storeTupleCreateMarket(source: CreateMarket) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.closeTime);
    builder.writeNumber(source.creatorStake);
    builder.writeNumber(source.feeBps);
    builder.writeCell(source.metadata);
    return builder.build();
}

export function dictValueParserCreateMarket(): DictionaryValue<CreateMarket> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCreateMarket(src)).endCell());
        },
        parse: (src) => {
            return loadCreateMarket(src.loadRef().beginParse());
        }
    }
}

export type PlaceBet = {
    $$type: 'PlaceBet';
    marketId: bigint;
    side: bigint;
    amount: bigint;
}

export function storePlaceBet(src: PlaceBet) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(910216531, 32);
        b_0.storeInt(src.marketId, 257);
        b_0.storeInt(src.side, 257);
        b_0.storeInt(src.amount, 257);
    };
}

export function loadPlaceBet(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 910216531) { throw Error('Invalid prefix'); }
    const _marketId = sc_0.loadIntBig(257);
    const _side = sc_0.loadIntBig(257);
    const _amount = sc_0.loadIntBig(257);
    return { $$type: 'PlaceBet' as const, marketId: _marketId, side: _side, amount: _amount };
}

export function loadTuplePlaceBet(source: TupleReader) {
    const _marketId = source.readBigNumber();
    const _side = source.readBigNumber();
    const _amount = source.readBigNumber();
    return { $$type: 'PlaceBet' as const, marketId: _marketId, side: _side, amount: _amount };
}

export function loadGetterTuplePlaceBet(source: TupleReader) {
    const _marketId = source.readBigNumber();
    const _side = source.readBigNumber();
    const _amount = source.readBigNumber();
    return { $$type: 'PlaceBet' as const, marketId: _marketId, side: _side, amount: _amount };
}

export function storeTuplePlaceBet(source: PlaceBet) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.marketId);
    builder.writeNumber(source.side);
    builder.writeNumber(source.amount);
    return builder.build();
}

export function dictValueParserPlaceBet(): DictionaryValue<PlaceBet> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storePlaceBet(src)).endCell());
        },
        parse: (src) => {
            return loadPlaceBet(src.loadRef().beginParse());
        }
    }
}

export type LockMarket = {
    $$type: 'LockMarket';
    marketId: bigint;
}

export function storeLockMarket(src: LockMarket) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1958838370, 32);
        b_0.storeInt(src.marketId, 257);
    };
}

export function loadLockMarket(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1958838370) { throw Error('Invalid prefix'); }
    const _marketId = sc_0.loadIntBig(257);
    return { $$type: 'LockMarket' as const, marketId: _marketId };
}

export function loadTupleLockMarket(source: TupleReader) {
    const _marketId = source.readBigNumber();
    return { $$type: 'LockMarket' as const, marketId: _marketId };
}

export function loadGetterTupleLockMarket(source: TupleReader) {
    const _marketId = source.readBigNumber();
    return { $$type: 'LockMarket' as const, marketId: _marketId };
}

export function storeTupleLockMarket(source: LockMarket) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.marketId);
    return builder.build();
}

export function dictValueParserLockMarket(): DictionaryValue<LockMarket> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeLockMarket(src)).endCell());
        },
        parse: (src) => {
            return loadLockMarket(src.loadRef().beginParse());
        }
    }
}

export type ResolveMarket = {
    $$type: 'ResolveMarket';
    marketId: bigint;
    outcome: bigint;
    creatorPenalty: bigint;
    rewardPayouts: Cell | null;
    slashList: Cell | null;
}

export function storeResolveMarket(src: ResolveMarket) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2010051374, 32);
        b_0.storeInt(src.marketId, 257);
        b_0.storeInt(src.outcome, 257);
        b_0.storeInt(src.creatorPenalty, 257);
        if (src.rewardPayouts !== null && src.rewardPayouts !== undefined) { b_0.storeBit(true).storeRef(src.rewardPayouts); } else { b_0.storeBit(false); }
        if (src.slashList !== null && src.slashList !== undefined) { b_0.storeBit(true).storeRef(src.slashList); } else { b_0.storeBit(false); }
    };
}

export function loadResolveMarket(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2010051374) { throw Error('Invalid prefix'); }
    const _marketId = sc_0.loadIntBig(257);
    const _outcome = sc_0.loadIntBig(257);
    const _creatorPenalty = sc_0.loadIntBig(257);
    const _rewardPayouts = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _slashList = sc_0.loadBit() ? sc_0.loadRef() : null;
    return { $$type: 'ResolveMarket' as const, marketId: _marketId, outcome: _outcome, creatorPenalty: _creatorPenalty, rewardPayouts: _rewardPayouts, slashList: _slashList };
}

export function loadTupleResolveMarket(source: TupleReader) {
    const _marketId = source.readBigNumber();
    const _outcome = source.readBigNumber();
    const _creatorPenalty = source.readBigNumber();
    const _rewardPayouts = source.readCellOpt();
    const _slashList = source.readCellOpt();
    return { $$type: 'ResolveMarket' as const, marketId: _marketId, outcome: _outcome, creatorPenalty: _creatorPenalty, rewardPayouts: _rewardPayouts, slashList: _slashList };
}

export function loadGetterTupleResolveMarket(source: TupleReader) {
    const _marketId = source.readBigNumber();
    const _outcome = source.readBigNumber();
    const _creatorPenalty = source.readBigNumber();
    const _rewardPayouts = source.readCellOpt();
    const _slashList = source.readCellOpt();
    return { $$type: 'ResolveMarket' as const, marketId: _marketId, outcome: _outcome, creatorPenalty: _creatorPenalty, rewardPayouts: _rewardPayouts, slashList: _slashList };
}

export function storeTupleResolveMarket(source: ResolveMarket) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.marketId);
    builder.writeNumber(source.outcome);
    builder.writeNumber(source.creatorPenalty);
    builder.writeCell(source.rewardPayouts);
    builder.writeCell(source.slashList);
    return builder.build();
}

export function dictValueParserResolveMarket(): DictionaryValue<ResolveMarket> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeResolveMarket(src)).endCell());
        },
        parse: (src) => {
            return loadResolveMarket(src.loadRef().beginParse());
        }
    }
}

export type CreditRewards = {
    $$type: 'CreditRewards';
    marketId: bigint;
    reward: bigint;
    payouts: Cell | null;
}

export function storeCreditRewards(src: CreditRewards) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(291497744, 32);
        b_0.storeInt(src.marketId, 257);
        b_0.storeInt(src.reward, 257);
        if (src.payouts !== null && src.payouts !== undefined) { b_0.storeBit(true).storeRef(src.payouts); } else { b_0.storeBit(false); }
    };
}

export function loadCreditRewards(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 291497744) { throw Error('Invalid prefix'); }
    const _marketId = sc_0.loadIntBig(257);
    const _reward = sc_0.loadIntBig(257);
    const _payouts = sc_0.loadBit() ? sc_0.loadRef() : null;
    return { $$type: 'CreditRewards' as const, marketId: _marketId, reward: _reward, payouts: _payouts };
}

export function loadTupleCreditRewards(source: TupleReader) {
    const _marketId = source.readBigNumber();
    const _reward = source.readBigNumber();
    const _payouts = source.readCellOpt();
    return { $$type: 'CreditRewards' as const, marketId: _marketId, reward: _reward, payouts: _payouts };
}

export function loadGetterTupleCreditRewards(source: TupleReader) {
    const _marketId = source.readBigNumber();
    const _reward = source.readBigNumber();
    const _payouts = source.readCellOpt();
    return { $$type: 'CreditRewards' as const, marketId: _marketId, reward: _reward, payouts: _payouts };
}

export function storeTupleCreditRewards(source: CreditRewards) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.marketId);
    builder.writeNumber(source.reward);
    builder.writeCell(source.payouts);
    return builder.build();
}

export function dictValueParserCreditRewards(): DictionaryValue<CreditRewards> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCreditRewards(src)).endCell());
        },
        parse: (src) => {
            return loadCreditRewards(src.loadRef().beginParse());
        }
    }
}

export type ApplySlash = {
    $$type: 'ApplySlash';
    marketId: bigint;
    entries: Cell | null;
}

export function storeApplySlash(src: ApplySlash) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2570802865, 32);
        b_0.storeInt(src.marketId, 257);
        if (src.entries !== null && src.entries !== undefined) { b_0.storeBit(true).storeRef(src.entries); } else { b_0.storeBit(false); }
    };
}

export function loadApplySlash(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2570802865) { throw Error('Invalid prefix'); }
    const _marketId = sc_0.loadIntBig(257);
    const _entries = sc_0.loadBit() ? sc_0.loadRef() : null;
    return { $$type: 'ApplySlash' as const, marketId: _marketId, entries: _entries };
}

export function loadTupleApplySlash(source: TupleReader) {
    const _marketId = source.readBigNumber();
    const _entries = source.readCellOpt();
    return { $$type: 'ApplySlash' as const, marketId: _marketId, entries: _entries };
}

export function loadGetterTupleApplySlash(source: TupleReader) {
    const _marketId = source.readBigNumber();
    const _entries = source.readCellOpt();
    return { $$type: 'ApplySlash' as const, marketId: _marketId, entries: _entries };
}

export function storeTupleApplySlash(source: ApplySlash) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.marketId);
    builder.writeCell(source.entries);
    return builder.build();
}

export function dictValueParserApplySlash(): DictionaryValue<ApplySlash> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeApplySlash(src)).endCell());
        },
        parse: (src) => {
            return loadApplySlash(src.loadRef().beginParse());
        }
    }
}

export type ClaimWinnings = {
    $$type: 'ClaimWinnings';
    marketId: bigint;
}

export function storeClaimWinnings(src: ClaimWinnings) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1905316452, 32);
        b_0.storeInt(src.marketId, 257);
    };
}

export function loadClaimWinnings(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1905316452) { throw Error('Invalid prefix'); }
    const _marketId = sc_0.loadIntBig(257);
    return { $$type: 'ClaimWinnings' as const, marketId: _marketId };
}

export function loadTupleClaimWinnings(source: TupleReader) {
    const _marketId = source.readBigNumber();
    return { $$type: 'ClaimWinnings' as const, marketId: _marketId };
}

export function loadGetterTupleClaimWinnings(source: TupleReader) {
    const _marketId = source.readBigNumber();
    return { $$type: 'ClaimWinnings' as const, marketId: _marketId };
}

export function storeTupleClaimWinnings(source: ClaimWinnings) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.marketId);
    return builder.build();
}

export function dictValueParserClaimWinnings(): DictionaryValue<ClaimWinnings> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeClaimWinnings(src)).endCell());
        },
        parse: (src) => {
            return loadClaimWinnings(src.loadRef().beginParse());
        }
    }
}

export type ClaimCreatorStake = {
    $$type: 'ClaimCreatorStake';
    marketId: bigint;
}

export function storeClaimCreatorStake(src: ClaimCreatorStake) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1501672126, 32);
        b_0.storeInt(src.marketId, 257);
    };
}

export function loadClaimCreatorStake(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1501672126) { throw Error('Invalid prefix'); }
    const _marketId = sc_0.loadIntBig(257);
    return { $$type: 'ClaimCreatorStake' as const, marketId: _marketId };
}

export function loadTupleClaimCreatorStake(source: TupleReader) {
    const _marketId = source.readBigNumber();
    return { $$type: 'ClaimCreatorStake' as const, marketId: _marketId };
}

export function loadGetterTupleClaimCreatorStake(source: TupleReader) {
    const _marketId = source.readBigNumber();
    return { $$type: 'ClaimCreatorStake' as const, marketId: _marketId };
}

export function storeTupleClaimCreatorStake(source: ClaimCreatorStake) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.marketId);
    return builder.build();
}

export function dictValueParserClaimCreatorStake(): DictionaryValue<ClaimCreatorStake> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeClaimCreatorStake(src)).endCell());
        },
        parse: (src) => {
            return loadClaimCreatorStake(src.loadRef().beginParse());
        }
    }
}

export type VoidMarket = {
    $$type: 'VoidMarket';
    marketId: bigint;
    reason: bigint;
}

export function storeVoidMarket(src: VoidMarket) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1579076871, 32);
        b_0.storeInt(src.marketId, 257);
        b_0.storeInt(src.reason, 257);
    };
}

export function loadVoidMarket(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1579076871) { throw Error('Invalid prefix'); }
    const _marketId = sc_0.loadIntBig(257);
    const _reason = sc_0.loadIntBig(257);
    return { $$type: 'VoidMarket' as const, marketId: _marketId, reason: _reason };
}

export function loadTupleVoidMarket(source: TupleReader) {
    const _marketId = source.readBigNumber();
    const _reason = source.readBigNumber();
    return { $$type: 'VoidMarket' as const, marketId: _marketId, reason: _reason };
}

export function loadGetterTupleVoidMarket(source: TupleReader) {
    const _marketId = source.readBigNumber();
    const _reason = source.readBigNumber();
    return { $$type: 'VoidMarket' as const, marketId: _marketId, reason: _reason };
}

export function storeTupleVoidMarket(source: VoidMarket) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.marketId);
    builder.writeNumber(source.reason);
    return builder.build();
}

export function dictValueParserVoidMarket(): DictionaryValue<VoidMarket> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVoidMarket(src)).endCell());
        },
        parse: (src) => {
            return loadVoidMarket(src.loadRef().beginParse());
        }
    }
}

export type WithdrawFees = {
    $$type: 'WithdrawFees';
}

export function storeWithdrawFees(src: WithdrawFees) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(539044870, 32);
    };
}

export function loadWithdrawFees(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 539044870) { throw Error('Invalid prefix'); }
    return { $$type: 'WithdrawFees' as const };
}

export function loadTupleWithdrawFees(source: TupleReader) {
    return { $$type: 'WithdrawFees' as const };
}

export function loadGetterTupleWithdrawFees(source: TupleReader) {
    return { $$type: 'WithdrawFees' as const };
}

export function storeTupleWithdrawFees(source: WithdrawFees) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserWithdrawFees(): DictionaryValue<WithdrawFees> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeWithdrawFees(src)).endCell());
        },
        parse: (src) => {
            return loadWithdrawFees(src.loadRef().beginParse());
        }
    }
}

export type Market = {
    $$type: 'Market';
    id: bigint;
    creator: Address;
    closeTime: bigint;
    status: bigint;
    outcome: bigint;
    creatorStake: bigint;
    yesPool: bigint;
    noPool: bigint;
    feeBps: bigint;
    rewardBps: bigint;
    platformFees: bigint;
    rewardPool: bigint;
    resolvedAt: bigint;
    metadata: Cell | null;
}

export function storeMarket(src: Market) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.id, 257);
        b_0.storeAddress(src.creator);
        b_0.storeInt(src.closeTime, 257);
        const b_1 = new Builder();
        b_1.storeInt(src.status, 257);
        b_1.storeInt(src.outcome, 257);
        b_1.storeInt(src.creatorStake, 257);
        const b_2 = new Builder();
        b_2.storeInt(src.yesPool, 257);
        b_2.storeInt(src.noPool, 257);
        b_2.storeInt(src.feeBps, 257);
        const b_3 = new Builder();
        b_3.storeInt(src.rewardBps, 257);
        b_3.storeInt(src.platformFees, 257);
        b_3.storeInt(src.rewardPool, 257);
        const b_4 = new Builder();
        b_4.storeInt(src.resolvedAt, 257);
        if (src.metadata !== null && src.metadata !== undefined) { b_4.storeBit(true).storeRef(src.metadata); } else { b_4.storeBit(false); }
        b_3.storeRef(b_4.endCell());
        b_2.storeRef(b_3.endCell());
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadMarket(slice: Slice) {
    const sc_0 = slice;
    const _id = sc_0.loadIntBig(257);
    const _creator = sc_0.loadAddress();
    const _closeTime = sc_0.loadIntBig(257);
    const sc_1 = sc_0.loadRef().beginParse();
    const _status = sc_1.loadIntBig(257);
    const _outcome = sc_1.loadIntBig(257);
    const _creatorStake = sc_1.loadIntBig(257);
    const sc_2 = sc_1.loadRef().beginParse();
    const _yesPool = sc_2.loadIntBig(257);
    const _noPool = sc_2.loadIntBig(257);
    const _feeBps = sc_2.loadIntBig(257);
    const sc_3 = sc_2.loadRef().beginParse();
    const _rewardBps = sc_3.loadIntBig(257);
    const _platformFees = sc_3.loadIntBig(257);
    const _rewardPool = sc_3.loadIntBig(257);
    const sc_4 = sc_3.loadRef().beginParse();
    const _resolvedAt = sc_4.loadIntBig(257);
    const _metadata = sc_4.loadBit() ? sc_4.loadRef() : null;
    return { $$type: 'Market' as const, id: _id, creator: _creator, closeTime: _closeTime, status: _status, outcome: _outcome, creatorStake: _creatorStake, yesPool: _yesPool, noPool: _noPool, feeBps: _feeBps, rewardBps: _rewardBps, platformFees: _platformFees, rewardPool: _rewardPool, resolvedAt: _resolvedAt, metadata: _metadata };
}

export function loadTupleMarket(source: TupleReader) {
    const _id = source.readBigNumber();
    const _creator = source.readAddress();
    const _closeTime = source.readBigNumber();
    const _status = source.readBigNumber();
    const _outcome = source.readBigNumber();
    const _creatorStake = source.readBigNumber();
    const _yesPool = source.readBigNumber();
    const _noPool = source.readBigNumber();
    const _feeBps = source.readBigNumber();
    const _rewardBps = source.readBigNumber();
    const _platformFees = source.readBigNumber();
    const _rewardPool = source.readBigNumber();
    const _resolvedAt = source.readBigNumber();
    const _metadata = source.readCellOpt();
    return { $$type: 'Market' as const, id: _id, creator: _creator, closeTime: _closeTime, status: _status, outcome: _outcome, creatorStake: _creatorStake, yesPool: _yesPool, noPool: _noPool, feeBps: _feeBps, rewardBps: _rewardBps, platformFees: _platformFees, rewardPool: _rewardPool, resolvedAt: _resolvedAt, metadata: _metadata };
}

export function loadGetterTupleMarket(source: TupleReader) {
    const _id = source.readBigNumber();
    const _creator = source.readAddress();
    const _closeTime = source.readBigNumber();
    const _status = source.readBigNumber();
    const _outcome = source.readBigNumber();
    const _creatorStake = source.readBigNumber();
    const _yesPool = source.readBigNumber();
    const _noPool = source.readBigNumber();
    const _feeBps = source.readBigNumber();
    const _rewardBps = source.readBigNumber();
    const _platformFees = source.readBigNumber();
    const _rewardPool = source.readBigNumber();
    const _resolvedAt = source.readBigNumber();
    const _metadata = source.readCellOpt();
    return { $$type: 'Market' as const, id: _id, creator: _creator, closeTime: _closeTime, status: _status, outcome: _outcome, creatorStake: _creatorStake, yesPool: _yesPool, noPool: _noPool, feeBps: _feeBps, rewardBps: _rewardBps, platformFees: _platformFees, rewardPool: _rewardPool, resolvedAt: _resolvedAt, metadata: _metadata };
}

export function storeTupleMarket(source: Market) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.id);
    builder.writeAddress(source.creator);
    builder.writeNumber(source.closeTime);
    builder.writeNumber(source.status);
    builder.writeNumber(source.outcome);
    builder.writeNumber(source.creatorStake);
    builder.writeNumber(source.yesPool);
    builder.writeNumber(source.noPool);
    builder.writeNumber(source.feeBps);
    builder.writeNumber(source.rewardBps);
    builder.writeNumber(source.platformFees);
    builder.writeNumber(source.rewardPool);
    builder.writeNumber(source.resolvedAt);
    builder.writeCell(source.metadata);
    return builder.build();
}

export function dictValueParserMarket(): DictionaryValue<Market> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMarket(src)).endCell());
        },
        parse: (src) => {
            return loadMarket(src.loadRef().beginParse());
        }
    }
}

export type BetPosition = {
    $$type: 'BetPosition';
    yesAmount: bigint;
    noAmount: bigint;
    claimedYes: boolean;
    claimedNo: boolean;
}

export function storeBetPosition(src: BetPosition) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.yesAmount, 257);
        b_0.storeInt(src.noAmount, 257);
        b_0.storeBit(src.claimedYes);
        b_0.storeBit(src.claimedNo);
    };
}

export function loadBetPosition(slice: Slice) {
    const sc_0 = slice;
    const _yesAmount = sc_0.loadIntBig(257);
    const _noAmount = sc_0.loadIntBig(257);
    const _claimedYes = sc_0.loadBit();
    const _claimedNo = sc_0.loadBit();
    return { $$type: 'BetPosition' as const, yesAmount: _yesAmount, noAmount: _noAmount, claimedYes: _claimedYes, claimedNo: _claimedNo };
}

export function loadTupleBetPosition(source: TupleReader) {
    const _yesAmount = source.readBigNumber();
    const _noAmount = source.readBigNumber();
    const _claimedYes = source.readBoolean();
    const _claimedNo = source.readBoolean();
    return { $$type: 'BetPosition' as const, yesAmount: _yesAmount, noAmount: _noAmount, claimedYes: _claimedYes, claimedNo: _claimedNo };
}

export function loadGetterTupleBetPosition(source: TupleReader) {
    const _yesAmount = source.readBigNumber();
    const _noAmount = source.readBigNumber();
    const _claimedYes = source.readBoolean();
    const _claimedNo = source.readBoolean();
    return { $$type: 'BetPosition' as const, yesAmount: _yesAmount, noAmount: _noAmount, claimedYes: _claimedYes, claimedNo: _claimedNo };
}

export function storeTupleBetPosition(source: BetPosition) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.yesAmount);
    builder.writeNumber(source.noAmount);
    builder.writeBoolean(source.claimedYes);
    builder.writeBoolean(source.claimedNo);
    return builder.build();
}

export function dictValueParserBetPosition(): DictionaryValue<BetPosition> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBetPosition(src)).endCell());
        },
        parse: (src) => {
            return loadBetPosition(src.loadRef().beginParse());
        }
    }
}

export type PositionBook = {
    $$type: 'PositionBook';
    entries: Dictionary<Address, BetPosition>;
}

export function storePositionBook(src: PositionBook) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeDict(src.entries, Dictionary.Keys.Address(), dictValueParserBetPosition());
    };
}

export function loadPositionBook(slice: Slice) {
    const sc_0 = slice;
    const _entries = Dictionary.load(Dictionary.Keys.Address(), dictValueParserBetPosition(), sc_0);
    return { $$type: 'PositionBook' as const, entries: _entries };
}

export function loadTuplePositionBook(source: TupleReader) {
    const _entries = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserBetPosition(), source.readCellOpt());
    return { $$type: 'PositionBook' as const, entries: _entries };
}

export function loadGetterTuplePositionBook(source: TupleReader) {
    const _entries = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserBetPosition(), source.readCellOpt());
    return { $$type: 'PositionBook' as const, entries: _entries };
}

export function storeTuplePositionBook(source: PositionBook) {
    const builder = new TupleBuilder();
    builder.writeCell(source.entries.size > 0 ? beginCell().storeDictDirect(source.entries, Dictionary.Keys.Address(), dictValueParserBetPosition()).endCell() : null);
    return builder.build();
}

export function dictValueParserPositionBook(): DictionaryValue<PositionBook> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storePositionBook(src)).endCell());
        },
        parse: (src) => {
            return loadPositionBook(src.loadRef().beginParse());
        }
    }
}

export type AverageAcc = {
    $$type: 'AverageAcc';
    sum: bigint;
    count: bigint;
}

export function storeAverageAcc(src: AverageAcc) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.sum, 257);
        b_0.storeInt(src.count, 257);
    };
}

export function loadAverageAcc(slice: Slice) {
    const sc_0 = slice;
    const _sum = sc_0.loadIntBig(257);
    const _count = sc_0.loadIntBig(257);
    return { $$type: 'AverageAcc' as const, sum: _sum, count: _count };
}

export function loadTupleAverageAcc(source: TupleReader) {
    const _sum = source.readBigNumber();
    const _count = source.readBigNumber();
    return { $$type: 'AverageAcc' as const, sum: _sum, count: _count };
}

export function loadGetterTupleAverageAcc(source: TupleReader) {
    const _sum = source.readBigNumber();
    const _count = source.readBigNumber();
    return { $$type: 'AverageAcc' as const, sum: _sum, count: _count };
}

export function storeTupleAverageAcc(source: AverageAcc) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.sum);
    builder.writeNumber(source.count);
    return builder.build();
}

export function dictValueParserAverageAcc(): DictionaryValue<AverageAcc> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeAverageAcc(src)).endCell());
        },
        parse: (src) => {
            return loadAverageAcc(src.loadRef().beginParse());
        }
    }
}

export type PredictionMarket$Data = {
    $$type: 'PredictionMarket$Data';
    admin: Address;
    treasury: Address;
    staking: Address;
    nextMarketId: bigint;
    markets: Dictionary<bigint, Market>;
    positions: Dictionary<bigint, PositionBook>;
    userCredits: Dictionary<Address, bigint>;
    platformVault: bigint;
}

export function storePredictionMarket$Data(src: PredictionMarket$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.admin);
        b_0.storeAddress(src.treasury);
        b_0.storeAddress(src.staking);
        const b_1 = new Builder();
        b_1.storeInt(src.nextMarketId, 257);
        b_1.storeDict(src.markets, Dictionary.Keys.BigInt(257), dictValueParserMarket());
        b_1.storeDict(src.positions, Dictionary.Keys.BigInt(257), dictValueParserPositionBook());
        b_1.storeDict(src.userCredits, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
        b_1.storeInt(src.platformVault, 257);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadPredictionMarket$Data(slice: Slice) {
    const sc_0 = slice;
    const _admin = sc_0.loadAddress();
    const _treasury = sc_0.loadAddress();
    const _staking = sc_0.loadAddress();
    const sc_1 = sc_0.loadRef().beginParse();
    const _nextMarketId = sc_1.loadIntBig(257);
    const _markets = Dictionary.load(Dictionary.Keys.BigInt(257), dictValueParserMarket(), sc_1);
    const _positions = Dictionary.load(Dictionary.Keys.BigInt(257), dictValueParserPositionBook(), sc_1);
    const _userCredits = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_1);
    const _platformVault = sc_1.loadIntBig(257);
    return { $$type: 'PredictionMarket$Data' as const, admin: _admin, treasury: _treasury, staking: _staking, nextMarketId: _nextMarketId, markets: _markets, positions: _positions, userCredits: _userCredits, platformVault: _platformVault };
}

export function loadTuplePredictionMarket$Data(source: TupleReader) {
    const _admin = source.readAddress();
    const _treasury = source.readAddress();
    const _staking = source.readAddress();
    const _nextMarketId = source.readBigNumber();
    const _markets = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserMarket(), source.readCellOpt());
    const _positions = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserPositionBook(), source.readCellOpt());
    const _userCredits = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _platformVault = source.readBigNumber();
    return { $$type: 'PredictionMarket$Data' as const, admin: _admin, treasury: _treasury, staking: _staking, nextMarketId: _nextMarketId, markets: _markets, positions: _positions, userCredits: _userCredits, platformVault: _platformVault };
}

export function loadGetterTuplePredictionMarket$Data(source: TupleReader) {
    const _admin = source.readAddress();
    const _treasury = source.readAddress();
    const _staking = source.readAddress();
    const _nextMarketId = source.readBigNumber();
    const _markets = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserMarket(), source.readCellOpt());
    const _positions = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserPositionBook(), source.readCellOpt());
    const _userCredits = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _platformVault = source.readBigNumber();
    return { $$type: 'PredictionMarket$Data' as const, admin: _admin, treasury: _treasury, staking: _staking, nextMarketId: _nextMarketId, markets: _markets, positions: _positions, userCredits: _userCredits, platformVault: _platformVault };
}

export function storeTuplePredictionMarket$Data(source: PredictionMarket$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.admin);
    builder.writeAddress(source.treasury);
    builder.writeAddress(source.staking);
    builder.writeNumber(source.nextMarketId);
    builder.writeCell(source.markets.size > 0 ? beginCell().storeDictDirect(source.markets, Dictionary.Keys.BigInt(257), dictValueParserMarket()).endCell() : null);
    builder.writeCell(source.positions.size > 0 ? beginCell().storeDictDirect(source.positions, Dictionary.Keys.BigInt(257), dictValueParserPositionBook()).endCell() : null);
    builder.writeCell(source.userCredits.size > 0 ? beginCell().storeDictDirect(source.userCredits, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeNumber(source.platformVault);
    return builder.build();
}

export function dictValueParserPredictionMarket$Data(): DictionaryValue<PredictionMarket$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storePredictionMarket$Data(src)).endCell());
        },
        parse: (src) => {
            return loadPredictionMarket$Data(src.loadRef().beginParse());
        }
    }
}

 type PredictionMarket_init_args = {
    $$type: 'PredictionMarket_init_args';
    admin: Address;
    treasury: Address;
    staking: Address;
}

function initPredictionMarket_init_args(src: PredictionMarket_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.admin);
        b_0.storeAddress(src.treasury);
        b_0.storeAddress(src.staking);
    };
}

async function PredictionMarket_init(admin: Address, treasury: Address, staking: Address) {
    const __code = Cell.fromHex('b5ee9c7241022501000ce0000228ff008e88f4a413f4bcf2c80bed5320e303ed43d9010902037c680204018bb64e7da89a1a400031c45f481f481f481a803a1020203ae01e809e809e809020203ae006020b020ae20acd8311c21f481f481f480aa4007a2b0e2dadadae1c4aa0fb678d903003004481010b23028101014133f40a6fa19401d70030925b6de2206e923070e0206ef2d080020158050701b7ac8376a268690000c7117d207d207d206a00e8408080eb807a027a027a02408080eb8018082c082b882b360c47087d207d207d202a9001e8ac38b6b6b6b8712a8bed9e36409037491836cc903779684037923782711037491836ef400600a881010154451359f40d6fa192306ddf206e92306d97d0f40401316f01e2206e925b6de0206ef2d0806f2181010b5859f40b6fa192306ddf206e92306d8e15d0810101d700810101d700d200d20055306c146f04e201b7af3476a268690000c7117d207d207d206a00e8408080eb807a027a027a02408080eb8018082c082b882b360c47087d207d207d202a9001e8ac38b6b6b6b8712a83ed9e36409037491836cc903779684037973787711037491836ef4008013a810101250259f40d6fa192306ddf206e92306d8e87d0db3c6c1e6f0ee21f03f83001d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e22fa40fa40fa40d401d0810101d700f404f404f404810101d700301058105710566c188e10fa40fa40fa40552003d158716d6d6d70e209925f09e07028d74920c21f953108d31f09de218210864b4da0bae3022182103640cd53bae3020a0c1002f05b07810101d700810101d700810101d700f40430f8428200eb3a248103e8bef2f48162f7f8235260bcf2f422c101917f95228101f4bce2948100c833de27a470547000806454711156100d10ac10be108a107908106705060e10cd10bd10ad109d0d08070605044313810101502ec855d0db3cc910344150210b007c206e953059f45a30944133f415e21057104610354143c87f01ca0055705078ce15ce13ce01c8810101cf0012f40012f40012f40012810101cf00cdc9ed5402fc5b07810101d700810101d700810101d70030f8428200eab222c209f2f48200970123c001917f9323c002e2f2f4258101012559f40d6fa192306ddf206e92306d8e87d0db3c6c1e6f0ee2815ce8216eb3f2f4206ef2d0806f2e8200a2fe2bc000f2f48200f0f5f8232db9f2f453f5a8812710a90420c100923070de5305a81f0d01fa812710a90420c100923070de5301bc923020de111121a1815bff21c200f2f45612c001935199a0955188a00809e2215612a116a0045611a01111a101111a01a05612810101561359f40d6fa192306ddf206e92306d97d0f40401316f01e26d216eb39830206ef2d0806f219131e22081010b561159f40b6fa192306ddf0e01fc206e92306d8e15d0810101d700810101d700d200d20055306c146f04e270207070246eb39b5f04206ef2d0806f2455209134e21115c001920ba094500ba00ae20211131a81010b0bc855305034810101cf00810101cf00ca00ca00c90311110348f0206e953059f45930944133f413e281010101c80101f400c9021111020f01e6561001206e953059f45a30944133f415e210ac109b108a107910681057106f1035441d5a1f8101011117c855d0db3cc910344aa0206e953059f45a30944133f415e2105710461035441359c87f01ca0055705078ce15ce13ce01c8810101cf0012f40012f40012f40012810101cf00cdc9ed5421044c21821074c18062bae30221821077cef32ebae3022182107190d264bae3022182105981b2beba1113181c04fe5b07810101d7003010671056104510344138db3c238101012a59f40d6fa192306ddf206e92306d8e87d0db3c6c1e6f0ee2815ce8216eb3f2f4206ef2d0806f2e8165b60bc0001bf2f4f8232bb9943af8230ade10bc10ac109c710908070605044313810101502ec855d0db3cc9103541a0206e953059f45a30944133f415e2231f21120062106710561045035024c87f01ca0055705078ce15ce13ce01c8810101cf0012f40012f40012f40012810101cf00cdc9ed5403fe5b07810101d700810101d700810101d700f404f40430107a10691058104a103948bcdb3c238101012c59f40d6fa192306ddf206e92306d8e87d0db3c6c1e6f0ee2815ce8216eb3f2f4206ef2d0806f2e31388124d529c00092397f9309c001e219f2f48200f1875615c001917f945615c002e2917f945615c003e2f2f45614231f1404eec00391739172e2f823111527b60820c200975177a150d7a00c9130e208111308071112070611110605111005104f103e4dc052a01112db3c550711165615701114db3c561111175615db3c109c108b0a11150a109f0811130807111107106e105d104f03111303021115020111160111128101011111c82415161700d831216e92307f9420c10131e29130e0c8216eb39e7f21ca003001206ef2d08021cc3096317021ca0030e2c982084c4b4070804029046d6d1036453304c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0000c630206e9130e0c8216eb39e7f21ca003001206ef2d08021cc3096317021ca0030e2c982084c4b4070804029046d6d1036453304c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00018455d0db3cc910374480206e953059f45a30944133f415e2476312c87f01ca0055705078ce15ce13ce01c8810101cf0012f40012f40012f40012810101cf00cdc9ed542102fa5b07810101d70030f842238101012359f40d6fa192306ddf206e92306d8e87d0db3c6c1e6f0ee2815ce8216eb3f2f4206ef2d0806f2e5f0632343434820099c721c002917f9321c003e2f2f4268101012759f40d6fa192306ddf206e92306d97d0f40401316f01e28200c95c216eb3f2f4206ef2d0806f212081010b271f1902fa59f40b6fa192306ddf206e92306d8e15d0810101d700810101d700d200d20055306c146f04e28200eb76216eb3f2f4206ef2d0806f247054702109c0038e2739393923c2009201b3923170e296353652067f05de21c20091b3923070e29733345441147f03dee30e5065a08154f021c200f2f45531431381010b5024c81a1b00ba2bc0019326c2009170e29204b3923470e28e153132810d4327c200f2f45337a827a9045240a07f03de0ac0029323c2009170e29201b3923170e28e193537810d4326c200f2f45205a85005a9045230a00543147f03923636e21046104501ee55305034810101cf00810101cf00ca00ca00c924103401206e953059f45930944133f413e281010101c80101f400c910354140206e953059f45a30944133f415e2107910681057104610355530db3cc87f01ca0055705078ce15ce13ce01c8810101cf0012f40012f40012f40012810101cf00cdc9ed542404e28f5b5b07810101d70030f84281010154441359f40d6fa192306ddf206e92306d8e87d0db3c6c1e6f0ee2815ce8216eb3f2f4206ef2d0806f2e10ab5f0b328200cc3f03c70512f2f48200d5dd21c00292317f9301c003e2f2f410575514e02182105e1ecd07bae3023920821020212c06ba1f1d1e220050c87f01ca0055705078ce15ce13ce01c8810101cf0012f40012f40012f40012810101cf00cdc9ed5404fe5b07810101d7003010671056104510344138db3c238101012a59f40d6fa192306ddf206e92306d8e87d0db3c6c1e6f0ee2815ce8216eb3f2f4206ef2d0806f2e31388124d529c00092397f9309c001e219f2f47320f8230811150807111407061113060511120504111104031110034fe052c01116db3c10bc10ac109c108e231f242000a6810101d700fa40810101d700d401d0810101d700810101d700810101d700d430d0810101d700810101d700810101d700d430d0810101d700810101d700810101d700d430d0810101d700f4043010be10bd10bc01c4107d7007061114060511130504111204031111030211100211151d8101011110c855d0db3cc9103646a0206e953059f45a30944133f415e20307c87f01ca0055705078ce15ce13ce01c8810101cf0012f40012f40012f40012810101cf00cdc9ed542100ac50de810101cf001bce19810101cf0007c8810101cf0016810101cf0014810101cf0002c8810101cf00810101cf0012810101cf0002c8810101cf0014810101cf0014810101cf0004c8810101cf0015f40013cdcdcdcd02f48f3c303710575514db3c20c2008e865360db3c3070dec87f01ca0055705078ce15ce13ce01c8810101cf0012f40012f40012f40012810101cf00cdc9ed54e0c00008c12118b08e2c10575514c87f01ca0055705078ce15ce13ce01c8810101cf0012f40012f40012f40012810101cf00cdc9ed54e05f08f2c082232400168200b35df84229c705f2f4009220c101915be02381010b238101014133f40a6fa19401d70030925b6de25c6eb39830206ef2d08001a0926c21e2102381010b59810101216e955b59f4593098c801cf004133f441e2016551aef3');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initPredictionMarket_init_args({ $$type: 'PredictionMarket_init_args', admin, treasury, staking })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const PredictionMarket_errors = {
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
    3395: { message: "POOL_ZERO" },
    9429: { message: "BAD_STATUS" },
    21744: { message: "NOTHING_TO_CLAIM" },
    23551: { message: "NET_ZERO" },
    23784: { message: "MARKET_NOT_FOUND" },
    25335: { message: "INVALID_CLOSE" },
    26038: { message: "ALREADY_LOCKED" },
    38657: { message: "INVALID_SIDE" },
    39367: { message: "NOT_RESOLVED" },
    41726: { message: "MARKET_NOT_OPEN" },
    45917: { message: "NOT_ADMIN" },
    51548: { message: "NO_BETS" },
    52287: { message: "NOT_CREATOR" },
    54749: { message: "NOT_DONE" },
    60082: { message: "BET_TOO_SMALL" },
    60218: { message: "STAKE_TOO_LOW" },
    60278: { message: "NO_POSITION" },
    61685: { message: "MARKET_CLOSED" },
    61831: { message: "BAD_OUTCOME" },
} as const

export const PredictionMarket_errors_backward = {
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
    "POOL_ZERO": 3395,
    "BAD_STATUS": 9429,
    "NOTHING_TO_CLAIM": 21744,
    "NET_ZERO": 23551,
    "MARKET_NOT_FOUND": 23784,
    "INVALID_CLOSE": 25335,
    "ALREADY_LOCKED": 26038,
    "INVALID_SIDE": 38657,
    "NOT_RESOLVED": 39367,
    "MARKET_NOT_OPEN": 41726,
    "NOT_ADMIN": 45917,
    "NO_BETS": 51548,
    "NOT_CREATOR": 52287,
    "NOT_DONE": 54749,
    "BET_TOO_SMALL": 60082,
    "STAKE_TOO_LOW": 60218,
    "NO_POSITION": 60278,
    "MARKET_CLOSED": 61685,
    "BAD_OUTCOME": 61831,
} as const

const PredictionMarket_types: ABIType[] = [
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
    {"name":"CreateMarket","header":2253082016,"fields":[{"name":"closeTime","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"creatorStake","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"feeBps","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"metadata","type":{"kind":"simple","type":"cell","optional":true}}]},
    {"name":"PlaceBet","header":910216531,"fields":[{"name":"marketId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"side","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"amount","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"LockMarket","header":1958838370,"fields":[{"name":"marketId","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"ResolveMarket","header":2010051374,"fields":[{"name":"marketId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"outcome","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"creatorPenalty","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"rewardPayouts","type":{"kind":"simple","type":"cell","optional":true}},{"name":"slashList","type":{"kind":"simple","type":"cell","optional":true}}]},
    {"name":"CreditRewards","header":291497744,"fields":[{"name":"marketId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"reward","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"payouts","type":{"kind":"simple","type":"cell","optional":true}}]},
    {"name":"ApplySlash","header":2570802865,"fields":[{"name":"marketId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"entries","type":{"kind":"simple","type":"cell","optional":true}}]},
    {"name":"ClaimWinnings","header":1905316452,"fields":[{"name":"marketId","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"ClaimCreatorStake","header":1501672126,"fields":[{"name":"marketId","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"VoidMarket","header":1579076871,"fields":[{"name":"marketId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"reason","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"WithdrawFees","header":539044870,"fields":[]},
    {"name":"Market","header":null,"fields":[{"name":"id","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"creator","type":{"kind":"simple","type":"address","optional":false}},{"name":"closeTime","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"status","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"outcome","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"creatorStake","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"yesPool","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"noPool","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"feeBps","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"rewardBps","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"platformFees","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"rewardPool","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"resolvedAt","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"metadata","type":{"kind":"simple","type":"cell","optional":true}}]},
    {"name":"BetPosition","header":null,"fields":[{"name":"yesAmount","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"noAmount","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"claimedYes","type":{"kind":"simple","type":"bool","optional":false}},{"name":"claimedNo","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"PositionBook","header":null,"fields":[{"name":"entries","type":{"kind":"dict","key":"address","value":"BetPosition","valueFormat":"ref"}}]},
    {"name":"AverageAcc","header":null,"fields":[{"name":"sum","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"count","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"PredictionMarket$Data","header":null,"fields":[{"name":"admin","type":{"kind":"simple","type":"address","optional":false}},{"name":"treasury","type":{"kind":"simple","type":"address","optional":false}},{"name":"staking","type":{"kind":"simple","type":"address","optional":false}},{"name":"nextMarketId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"markets","type":{"kind":"dict","key":"int","value":"Market","valueFormat":"ref"}},{"name":"positions","type":{"kind":"dict","key":"int","value":"PositionBook","valueFormat":"ref"}},{"name":"userCredits","type":{"kind":"dict","key":"address","value":"int"}},{"name":"platformVault","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
]

const PredictionMarket_opcodes = {
    "CreateMarket": 2253082016,
    "PlaceBet": 910216531,
    "LockMarket": 1958838370,
    "ResolveMarket": 2010051374,
    "CreditRewards": 291497744,
    "ApplySlash": 2570802865,
    "ClaimWinnings": 1905316452,
    "ClaimCreatorStake": 1501672126,
    "VoidMarket": 1579076871,
    "WithdrawFees": 539044870,
}

const PredictionMarket_getters: ABIGetter[] = [
    {"name":"marketInfo","methodId":114280,"arguments":[{"name":"id","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"Market","optional":true}},
    {"name":"positionOf","methodId":110854,"arguments":[{"name":"id","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"user","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"BetPosition","optional":true}},
    {"name":"creditOf","methodId":103027,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
]

export const PredictionMarket_getterMapping: { [key: string]: string } = {
    'marketInfo': 'getMarketInfo',
    'positionOf': 'getPositionOf',
    'creditOf': 'getCreditOf',
}

const PredictionMarket_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"empty"}},
    {"receiver":"internal","message":{"kind":"typed","type":"CreateMarket"}},
    {"receiver":"internal","message":{"kind":"typed","type":"PlaceBet"}},
    {"receiver":"internal","message":{"kind":"typed","type":"LockMarket"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ResolveMarket"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ClaimWinnings"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ClaimCreatorStake"}},
    {"receiver":"internal","message":{"kind":"typed","type":"VoidMarket"}},
    {"receiver":"internal","message":{"kind":"typed","type":"WithdrawFees"}},
]

export const MIN_CREATOR_STAKE = 1000n;
export const MIN_BET_AMOUNT = 10n;
export const DEFAULT_FEE_BPS = 200n;
export const DEFAULT_REWARD_BPS = 100n;
export const MAX_FEE_BPS = 500n;
export const STATUS_OPEN = 0n;
export const STATUS_LOCKED = 1n;
export const STATUS_RESOLVED = 2n;
export const STATUS_VOID = 3n;

export class PredictionMarket implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = PredictionMarket_errors_backward;
    public static readonly opcodes = PredictionMarket_opcodes;
    
    static async init(admin: Address, treasury: Address, staking: Address) {
        return await PredictionMarket_init(admin, treasury, staking);
    }
    
    static async fromInit(admin: Address, treasury: Address, staking: Address) {
        const __gen_init = await PredictionMarket_init(admin, treasury, staking);
        const address = contractAddress(0, __gen_init);
        return new PredictionMarket(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new PredictionMarket(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  PredictionMarket_types,
        getters: PredictionMarket_getters,
        receivers: PredictionMarket_receivers,
        errors: PredictionMarket_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: null | CreateMarket | PlaceBet | LockMarket | ResolveMarket | ClaimWinnings | ClaimCreatorStake | VoidMarket | WithdrawFees) {
        
        let body: Cell | null = null;
        if (message === null) {
            body = new Cell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'CreateMarket') {
            body = beginCell().store(storeCreateMarket(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'PlaceBet') {
            body = beginCell().store(storePlaceBet(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'LockMarket') {
            body = beginCell().store(storeLockMarket(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ResolveMarket') {
            body = beginCell().store(storeResolveMarket(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ClaimWinnings') {
            body = beginCell().store(storeClaimWinnings(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ClaimCreatorStake') {
            body = beginCell().store(storeClaimCreatorStake(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'VoidMarket') {
            body = beginCell().store(storeVoidMarket(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'WithdrawFees') {
            body = beginCell().store(storeWithdrawFees(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getMarketInfo(provider: ContractProvider, id: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(id);
        const source = (await provider.get('marketInfo', builder.build())).stack;
        const result_p = source.readTupleOpt();
        const result = result_p ? loadTupleMarket(result_p) : null;
        return result;
    }
    
    async getPositionOf(provider: ContractProvider, id: bigint, user: Address) {
        const builder = new TupleBuilder();
        builder.writeNumber(id);
        builder.writeAddress(user);
        const source = (await provider.get('positionOf', builder.build())).stack;
        const result_p = source.readTupleOpt();
        const result = result_p ? loadTupleBetPosition(result_p) : null;
        return result;
    }
    
    async getCreditOf(provider: ContractProvider, user: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(user);
        const source = (await provider.get('creditOf', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
}