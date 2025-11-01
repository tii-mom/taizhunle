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

export type ConfigurePrice = {
    $$type: 'ConfigurePrice';
    round: bigint;
    price: bigint;
}

export function storeConfigurePrice(src: ConfigurePrice) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2986189982, 32);
        b_0.storeInt(src.round, 257);
        b_0.storeInt(src.price, 257);
    };
}

export function loadConfigurePrice(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2986189982) { throw Error('Invalid prefix'); }
    const _round = sc_0.loadIntBig(257);
    const _price = sc_0.loadIntBig(257);
    return { $$type: 'ConfigurePrice' as const, round: _round, price: _price };
}

export function loadTupleConfigurePrice(source: TupleReader) {
    const _round = source.readBigNumber();
    const _price = source.readBigNumber();
    return { $$type: 'ConfigurePrice' as const, round: _round, price: _price };
}

export function loadGetterTupleConfigurePrice(source: TupleReader) {
    const _round = source.readBigNumber();
    const _price = source.readBigNumber();
    return { $$type: 'ConfigurePrice' as const, round: _round, price: _price };
}

export function storeTupleConfigurePrice(source: ConfigurePrice) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.round);
    builder.writeNumber(source.price);
    return builder.build();
}

export function dictValueParserConfigurePrice(): DictionaryValue<ConfigurePrice> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeConfigurePrice(src)).endCell());
        },
        parse: (src) => {
            return loadConfigurePrice(src.loadRef().beginParse());
        }
    }
}

export type ReleaseRound = {
    $$type: 'ReleaseRound';
    round: bigint;
}

export function storeReleaseRound(src: ReleaseRound) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(410740867, 32);
        b_0.storeInt(src.round, 257);
    };
}

export function loadReleaseRound(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 410740867) { throw Error('Invalid prefix'); }
    const _round = sc_0.loadIntBig(257);
    return { $$type: 'ReleaseRound' as const, round: _round };
}

export function loadTupleReleaseRound(source: TupleReader) {
    const _round = source.readBigNumber();
    return { $$type: 'ReleaseRound' as const, round: _round };
}

export function loadGetterTupleReleaseRound(source: TupleReader) {
    const _round = source.readBigNumber();
    return { $$type: 'ReleaseRound' as const, round: _round };
}

export function storeTupleReleaseRound(source: ReleaseRound) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.round);
    return builder.build();
}

export function dictValueParserReleaseRound(): DictionaryValue<ReleaseRound> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeReleaseRound(src)).endCell());
        },
        parse: (src) => {
            return loadReleaseRound(src.loadRef().beginParse());
        }
    }
}

export type RoundStatus = {
    $$type: 'RoundStatus';
    price: bigint;
    configured: boolean;
    released: boolean;
}

export function storeRoundStatus(src: RoundStatus) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.price, 257);
        b_0.storeBit(src.configured);
        b_0.storeBit(src.released);
    };
}

export function loadRoundStatus(slice: Slice) {
    const sc_0 = slice;
    const _price = sc_0.loadIntBig(257);
    const _configured = sc_0.loadBit();
    const _released = sc_0.loadBit();
    return { $$type: 'RoundStatus' as const, price: _price, configured: _configured, released: _released };
}

export function loadTupleRoundStatus(source: TupleReader) {
    const _price = source.readBigNumber();
    const _configured = source.readBoolean();
    const _released = source.readBoolean();
    return { $$type: 'RoundStatus' as const, price: _price, configured: _configured, released: _released };
}

export function loadGetterTupleRoundStatus(source: TupleReader) {
    const _price = source.readBigNumber();
    const _configured = source.readBoolean();
    const _released = source.readBoolean();
    return { $$type: 'RoundStatus' as const, price: _price, configured: _configured, released: _released };
}

export function storeTupleRoundStatus(source: RoundStatus) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.price);
    builder.writeBoolean(source.configured);
    builder.writeBoolean(source.released);
    return builder.build();
}

export function dictValueParserRoundStatus(): DictionaryValue<RoundStatus> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRoundStatus(src)).endCell());
        },
        parse: (src) => {
            return loadRoundStatus(src.loadRef().beginParse());
        }
    }
}

export type VestingSummary = {
    $$type: 'VestingSummary';
    totalLocked: bigint;
    released: bigint;
    remaining: bigint;
    lastConfiguredRound: bigint;
}

export function storeVestingSummary(src: VestingSummary) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.totalLocked, 257);
        b_0.storeInt(src.released, 257);
        b_0.storeInt(src.remaining, 257);
        const b_1 = new Builder();
        b_1.storeInt(src.lastConfiguredRound, 257);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadVestingSummary(slice: Slice) {
    const sc_0 = slice;
    const _totalLocked = sc_0.loadIntBig(257);
    const _released = sc_0.loadIntBig(257);
    const _remaining = sc_0.loadIntBig(257);
    const sc_1 = sc_0.loadRef().beginParse();
    const _lastConfiguredRound = sc_1.loadIntBig(257);
    return { $$type: 'VestingSummary' as const, totalLocked: _totalLocked, released: _released, remaining: _remaining, lastConfiguredRound: _lastConfiguredRound };
}

export function loadTupleVestingSummary(source: TupleReader) {
    const _totalLocked = source.readBigNumber();
    const _released = source.readBigNumber();
    const _remaining = source.readBigNumber();
    const _lastConfiguredRound = source.readBigNumber();
    return { $$type: 'VestingSummary' as const, totalLocked: _totalLocked, released: _released, remaining: _remaining, lastConfiguredRound: _lastConfiguredRound };
}

export function loadGetterTupleVestingSummary(source: TupleReader) {
    const _totalLocked = source.readBigNumber();
    const _released = source.readBigNumber();
    const _remaining = source.readBigNumber();
    const _lastConfiguredRound = source.readBigNumber();
    return { $$type: 'VestingSummary' as const, totalLocked: _totalLocked, released: _released, remaining: _remaining, lastConfiguredRound: _lastConfiguredRound };
}

export function storeTupleVestingSummary(source: VestingSummary) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.totalLocked);
    builder.writeNumber(source.released);
    builder.writeNumber(source.remaining);
    builder.writeNumber(source.lastConfiguredRound);
    return builder.build();
}

export function dictValueParserVestingSummary(): DictionaryValue<VestingSummary> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVestingSummary(src)).endCell());
        },
        parse: (src) => {
            return loadVestingSummary(src.loadRef().beginParse());
        }
    }
}

export type VestingContract$Data = {
    $$type: 'VestingContract$Data';
    owner: Address;
    token: Address;
    totalLocked: bigint;
    released: bigint;
    roundPrices: Dictionary<bigint, bigint>;
    roundReleased: Dictionary<bigint, boolean>;
    lastConfiguredRound: bigint;
}

export function storeVestingContract$Data(src: VestingContract$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.token);
        b_0.storeInt(src.totalLocked, 257);
        const b_1 = new Builder();
        b_1.storeInt(src.released, 257);
        b_1.storeDict(src.roundPrices, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        b_1.storeDict(src.roundReleased, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool());
        b_1.storeInt(src.lastConfiguredRound, 257);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadVestingContract$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _token = sc_0.loadAddress();
    const _totalLocked = sc_0.loadIntBig(257);
    const sc_1 = sc_0.loadRef().beginParse();
    const _released = sc_1.loadIntBig(257);
    const _roundPrices = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), sc_1);
    const _roundReleased = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), sc_1);
    const _lastConfiguredRound = sc_1.loadIntBig(257);
    return { $$type: 'VestingContract$Data' as const, owner: _owner, token: _token, totalLocked: _totalLocked, released: _released, roundPrices: _roundPrices, roundReleased: _roundReleased, lastConfiguredRound: _lastConfiguredRound };
}

export function loadTupleVestingContract$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _token = source.readAddress();
    const _totalLocked = source.readBigNumber();
    const _released = source.readBigNumber();
    const _roundPrices = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _roundReleased = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    const _lastConfiguredRound = source.readBigNumber();
    return { $$type: 'VestingContract$Data' as const, owner: _owner, token: _token, totalLocked: _totalLocked, released: _released, roundPrices: _roundPrices, roundReleased: _roundReleased, lastConfiguredRound: _lastConfiguredRound };
}

export function loadGetterTupleVestingContract$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _token = source.readAddress();
    const _totalLocked = source.readBigNumber();
    const _released = source.readBigNumber();
    const _roundPrices = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _roundReleased = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    const _lastConfiguredRound = source.readBigNumber();
    return { $$type: 'VestingContract$Data' as const, owner: _owner, token: _token, totalLocked: _totalLocked, released: _released, roundPrices: _roundPrices, roundReleased: _roundReleased, lastConfiguredRound: _lastConfiguredRound };
}

export function storeTupleVestingContract$Data(source: VestingContract$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeAddress(source.token);
    builder.writeNumber(source.totalLocked);
    builder.writeNumber(source.released);
    builder.writeCell(source.roundPrices.size > 0 ? beginCell().storeDictDirect(source.roundPrices, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.roundReleased.size > 0 ? beginCell().storeDictDirect(source.roundReleased, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool()).endCell() : null);
    builder.writeNumber(source.lastConfiguredRound);
    return builder.build();
}

export function dictValueParserVestingContract$Data(): DictionaryValue<VestingContract$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVestingContract$Data(src)).endCell());
        },
        parse: (src) => {
            return loadVestingContract$Data(src.loadRef().beginParse());
        }
    }
}

 type VestingContract_init_args = {
    $$type: 'VestingContract_init_args';
    owner: Address;
    token: Address;
    firstRoundPrice: bigint;
}

function initVestingContract_init_args(src: VestingContract_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.token);
        b_0.storeInt(src.firstRoundPrice, 257);
    };
}

async function VestingContract_init(owner: Address, token: Address, firstRoundPrice: bigint) {
    const __code = Cell.fromHex('b5ee9c7241020d010003b7000228ff008e88f4a413f4bcf2c80bed5320e303ed43d90106020271020402bfbd7a976a268690000c727fd207d20408080eb802a9001e8ac410c0a7a3582003836b6c08080b8aa08110b90b74aadacfa2d184c6400e7802099fa2171408080b8b810882390b74aadacfa2d184c6400e7802099fa2171209838f186ed9e363a40703000e5343a15465502302c3bd512f6a268690000c727fd207d20408080eb802a9001e8ac410c0a7a3582003836b6c08080b8aa08110b90b74aadacfa2d184c6400e7802099fa2171408080b8b810882390b74aadacfa2d184c6400e7802099fa2171209838f186aa836d9e3639c0705009681010154540052304133f40c6fa19401d70030925b6de2206e945b707070e0810101544413714133f40c6fa19401d70030925b6de270216eb39630206ef2d0809131e201206ef2d0807f5802f63001d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e4ffa40fa40810101d700552003d158821814f46b0400706d6d8101017154102217216e955b59f45a3098c801cf004133f442e28101017170211047216e955b59f45a3098c801cf004133f442e2413071e30d08925f08e07027d7492007080046fa40fa40810101d700d401d0810101d700f404f404810101d700301047104610456c1702b4c21f953107d31f08de218210b1fda49ebae302218210187b6883bae30238c00007c12117b08e2d10465513c87f01ca0055605067ce14ce12810101cf0001c8810101cf0012f40012f40012810101cf00cdc9ed54e05f07f2c082090b01ee5b06810101d700810101d700308200bb75f84228c705f2f481506222c201f2f481664422c113f2f48200821e09a45220ba19f2f48200831d28c200f2f481010154311050aa216e955b59f45a3098c801cf004133f442e205810101277071216e955b59f45a3098c801cf004133f442e2104610354403020a0052c87f01ca0055605067ce14ce12810101cf0001c8810101cf0012f40012f40012810101cf00cdc9ed5401fa5b06810101d700308200bb75f84227c705f2f4810d8221c200f2f481664421c113f2f481010154520052304133f40c6fa19401d70030925b6de28200c5a8016eb3f2f42681010122714133f40c6fa19401d70030925b6de2206eb39d812e8401206ef2d080c000f2f49130e2820082e32382112a05f200a025bbf2f4020c00a282112a05f200a01681010150037f71216e955b59f45a3098c801cf004133f442e210461035440302c87f01ca0055605067ce14ce12810101cf0001c8810101cf0012f40012f40012810101cf00cdc9ed548a50b4ba');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initVestingContract_init_args({ $$type: 'VestingContract_init_args', owner, token, firstRoundPrice })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const VestingContract_errors = {
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
    3458: { message: "INVALID_ROUND" },
    11908: { message: "ALREADY_RELEASED" },
    20578: { message: "ROUND_ONE_LOCKED" },
    26180: { message: "ROUND_LIMIT" },
    33310: { message: "ORDER" },
    33507: { message: "EXCEEDS_LOCKED" },
    33565: { message: "INVALID_PRICE" },
    47989: { message: "NOT_OWNER" },
    50600: { message: "PRICE_NOT_SET" },
} as const

export const VestingContract_errors_backward = {
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
    "INVALID_ROUND": 3458,
    "ALREADY_RELEASED": 11908,
    "ROUND_ONE_LOCKED": 20578,
    "ROUND_LIMIT": 26180,
    "ORDER": 33310,
    "EXCEEDS_LOCKED": 33507,
    "INVALID_PRICE": 33565,
    "NOT_OWNER": 47989,
    "PRICE_NOT_SET": 50600,
} as const

const VestingContract_types: ABIType[] = [
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
    {"name":"ConfigurePrice","header":2986189982,"fields":[{"name":"round","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"price","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"ReleaseRound","header":410740867,"fields":[{"name":"round","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"RoundStatus","header":null,"fields":[{"name":"price","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"configured","type":{"kind":"simple","type":"bool","optional":false}},{"name":"released","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"VestingSummary","header":null,"fields":[{"name":"totalLocked","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"released","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"remaining","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"lastConfiguredRound","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"VestingContract$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"token","type":{"kind":"simple","type":"address","optional":false}},{"name":"totalLocked","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"released","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"roundPrices","type":{"kind":"dict","key":"int","value":"int"}},{"name":"roundReleased","type":{"kind":"dict","key":"int","value":"bool"}},{"name":"lastConfiguredRound","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
]

const VestingContract_opcodes = {
    "ConfigurePrice": 2986189982,
    "ReleaseRound": 410740867,
}

const VestingContract_getters: ABIGetter[] = [
    {"name":"summary","methodId":77650,"arguments":[],"returnType":{"kind":"simple","type":"VestingSummary","optional":false}},
    {"name":"roundInfo","methodId":109093,"arguments":[{"name":"roundId","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"RoundStatus","optional":false}},
]

export const VestingContract_getterMapping: { [key: string]: string } = {
    'summary': 'getSummary',
    'roundInfo': 'getRoundInfo',
}

const VestingContract_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"empty"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ConfigurePrice"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ReleaseRound"}},
]

export const TOTAL_LOCKED = 90000000000n;
export const TOTAL_ROUNDS = 18n;
export const LOCK_PER_ROUND = 5000000000n;

export class VestingContract implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = VestingContract_errors_backward;
    public static readonly opcodes = VestingContract_opcodes;
    
    static async init(owner: Address, token: Address, firstRoundPrice: bigint) {
        return await VestingContract_init(owner, token, firstRoundPrice);
    }
    
    static async fromInit(owner: Address, token: Address, firstRoundPrice: bigint) {
        const __gen_init = await VestingContract_init(owner, token, firstRoundPrice);
        const address = contractAddress(0, __gen_init);
        return new VestingContract(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new VestingContract(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  VestingContract_types,
        getters: VestingContract_getters,
        receivers: VestingContract_receivers,
        errors: VestingContract_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: null | ConfigurePrice | ReleaseRound) {
        
        let body: Cell | null = null;
        if (message === null) {
            body = new Cell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ConfigurePrice') {
            body = beginCell().store(storeConfigurePrice(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ReleaseRound') {
            body = beginCell().store(storeReleaseRound(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getSummary(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('summary', builder.build())).stack;
        const result = loadGetterTupleVestingSummary(source);
        return result;
    }
    
    async getRoundInfo(provider: ContractProvider, roundId: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(roundId);
        const source = (await provider.get('roundInfo', builder.build())).stack;
        const result = loadGetterTupleRoundStatus(source);
        return result;
    }
    
}