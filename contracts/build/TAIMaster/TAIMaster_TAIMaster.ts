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

export type TransferLocked = {
    $$type: 'TransferLocked';
}

export function storeTransferLocked(src: TransferLocked) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(4234368437, 32);
    };
}

export function loadTransferLocked(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 4234368437) { throw Error('Invalid prefix'); }
    return { $$type: 'TransferLocked' as const };
}

export function loadTupleTransferLocked(source: TupleReader) {
    return { $$type: 'TransferLocked' as const };
}

export function loadGetterTupleTransferLocked(source: TupleReader) {
    return { $$type: 'TransferLocked' as const };
}

export function storeTupleTransferLocked(source: TransferLocked) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserTransferLocked(): DictionaryValue<TransferLocked> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTransferLocked(src)).endCell());
        },
        parse: (src) => {
            return loadTransferLocked(src.loadRef().beginParse());
        }
    }
}

export type TransferTokens = {
    $$type: 'TransferTokens';
    to: Address;
    amount: bigint;
}

export function storeTransferTokens(src: TransferTokens) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3690960551, 32);
        b_0.storeAddress(src.to);
        b_0.storeInt(src.amount, 257);
    };
}

export function loadTransferTokens(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3690960551) { throw Error('Invalid prefix'); }
    const _to = sc_0.loadAddress();
    const _amount = sc_0.loadIntBig(257);
    return { $$type: 'TransferTokens' as const, to: _to, amount: _amount };
}

export function loadTupleTransferTokens(source: TupleReader) {
    const _to = source.readAddress();
    const _amount = source.readBigNumber();
    return { $$type: 'TransferTokens' as const, to: _to, amount: _amount };
}

export function loadGetterTupleTransferTokens(source: TupleReader) {
    const _to = source.readAddress();
    const _amount = source.readBigNumber();
    return { $$type: 'TransferTokens' as const, to: _to, amount: _amount };
}

export function storeTupleTransferTokens(source: TransferTokens) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.to);
    builder.writeNumber(source.amount);
    return builder.build();
}

export function dictValueParserTransferTokens(): DictionaryValue<TransferTokens> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTransferTokens(src)).endCell());
        },
        parse: (src) => {
            return loadTransferTokens(src.loadRef().beginParse());
        }
    }
}

export type SupplySummary = {
    $$type: 'SupplySummary';
    total: bigint;
    locked: bigint;
    circulating: bigint;
    lockedTransferred: boolean;
}

export function storeSupplySummary(src: SupplySummary) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.total, 257);
        b_0.storeInt(src.locked, 257);
        b_0.storeInt(src.circulating, 257);
        b_0.storeBit(src.lockedTransferred);
    };
}

export function loadSupplySummary(slice: Slice) {
    const sc_0 = slice;
    const _total = sc_0.loadIntBig(257);
    const _locked = sc_0.loadIntBig(257);
    const _circulating = sc_0.loadIntBig(257);
    const _lockedTransferred = sc_0.loadBit();
    return { $$type: 'SupplySummary' as const, total: _total, locked: _locked, circulating: _circulating, lockedTransferred: _lockedTransferred };
}

export function loadTupleSupplySummary(source: TupleReader) {
    const _total = source.readBigNumber();
    const _locked = source.readBigNumber();
    const _circulating = source.readBigNumber();
    const _lockedTransferred = source.readBoolean();
    return { $$type: 'SupplySummary' as const, total: _total, locked: _locked, circulating: _circulating, lockedTransferred: _lockedTransferred };
}

export function loadGetterTupleSupplySummary(source: TupleReader) {
    const _total = source.readBigNumber();
    const _locked = source.readBigNumber();
    const _circulating = source.readBigNumber();
    const _lockedTransferred = source.readBoolean();
    return { $$type: 'SupplySummary' as const, total: _total, locked: _locked, circulating: _circulating, lockedTransferred: _lockedTransferred };
}

export function storeTupleSupplySummary(source: SupplySummary) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.total);
    builder.writeNumber(source.locked);
    builder.writeNumber(source.circulating);
    builder.writeBoolean(source.lockedTransferred);
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

export type TAIMaster$Data = {
    $$type: 'TAIMaster$Data';
    owner: Address;
    vesting: Address;
    totalSupply: bigint;
    lockedSupply: bigint;
    balances: Dictionary<Address, bigint>;
    lockedMoved: boolean;
}

export function storeTAIMaster$Data(src: TAIMaster$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.vesting);
        b_0.storeInt(src.totalSupply, 257);
        const b_1 = new Builder();
        b_1.storeInt(src.lockedSupply, 257);
        b_1.storeDict(src.balances, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
        b_1.storeBit(src.lockedMoved);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadTAIMaster$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _vesting = sc_0.loadAddress();
    const _totalSupply = sc_0.loadIntBig(257);
    const sc_1 = sc_0.loadRef().beginParse();
    const _lockedSupply = sc_1.loadIntBig(257);
    const _balances = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_1);
    const _lockedMoved = sc_1.loadBit();
    return { $$type: 'TAIMaster$Data' as const, owner: _owner, vesting: _vesting, totalSupply: _totalSupply, lockedSupply: _lockedSupply, balances: _balances, lockedMoved: _lockedMoved };
}

export function loadTupleTAIMaster$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _vesting = source.readAddress();
    const _totalSupply = source.readBigNumber();
    const _lockedSupply = source.readBigNumber();
    const _balances = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _lockedMoved = source.readBoolean();
    return { $$type: 'TAIMaster$Data' as const, owner: _owner, vesting: _vesting, totalSupply: _totalSupply, lockedSupply: _lockedSupply, balances: _balances, lockedMoved: _lockedMoved };
}

export function loadGetterTupleTAIMaster$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _vesting = source.readAddress();
    const _totalSupply = source.readBigNumber();
    const _lockedSupply = source.readBigNumber();
    const _balances = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _lockedMoved = source.readBoolean();
    return { $$type: 'TAIMaster$Data' as const, owner: _owner, vesting: _vesting, totalSupply: _totalSupply, lockedSupply: _lockedSupply, balances: _balances, lockedMoved: _lockedMoved };
}

export function storeTupleTAIMaster$Data(source: TAIMaster$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeAddress(source.vesting);
    builder.writeNumber(source.totalSupply);
    builder.writeNumber(source.lockedSupply);
    builder.writeCell(source.balances.size > 0 ? beginCell().storeDictDirect(source.balances, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeBoolean(source.lockedMoved);
    return builder.build();
}

export function dictValueParserTAIMaster$Data(): DictionaryValue<TAIMaster$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTAIMaster$Data(src)).endCell());
        },
        parse: (src) => {
            return loadTAIMaster$Data(src.loadRef().beginParse());
        }
    }
}

 type TAIMaster_init_args = {
    $$type: 'TAIMaster_init_args';
    owner: Address;
    vesting: Address;
}

function initTAIMaster_init_args(src: TAIMaster_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.vesting);
    };
}

async function TAIMaster_init(owner: Address, vesting: Address) {
    const __code = Cell.fromHex('b5ee9c7241020c0100030b000228ff008e88f4a413f4bcf2c80bed5320e303ed43d90106020378a0020401d1baf52ed44d0d200018e1efa40fa40810101d700d401d0810101d700f404d200301036103510346c168e39fa40fa405902d101218218174876e800821814f46b0400706d81010b54102418810101216e955b59f4593098c801cf004133f441e210355502e2db3c6c64803000c5da15464402301d5bba93ed44d0d200018e1efa40fa40810101d700d401d0810101d700f404d200301036103510346c168e39fa40fa405902d101218218174876e800821814f46b0400706d81010b54102418810101216e955b59f4593098c801cf004133f441e210355502e25505db3c6c618050104db3c0a01f63001d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e1efa40fa40810101d700d401d0810101d700f404d200301036103510346c168e39fa40fa405902d101218218174876e800821814f46b0400706d81010b54102418810101216e955b59f4593098c801cf004133f441e210355502e2070702b8925f07e07026d74920c21f953106d31f07de218210fc6355b5bae302218210dbff96a7bae30237c00006c12116b08e2610355512c87f01ca0055505056ce13ce810101cf0001c8810101cf0012f40012ca00cdc9ed54e05f06f2c082080903cc5b358200bb75f84225c705f2f48165b626b3f2f423061035440302db3c8145e45314bef2f481010b5114a127103401810101216e955b59f4593098c801cf004133f441e25114db3c81010b3223a05250810101216e955b59f4593098c801cf004133f441e27f0a0a0b03e05b05fa40810101d700308200bb75f84227c705f2f4812a6121c200f2f4541675db3c8145e45319bef2f481010b5119a127103401810101216e955b59f4593098c801cf004133f441e25116db3c81010b09a010234870810101216e955b59f4593098c801cf004133f441e210354403020a0a0b004481010b23028101014133f40a6fa19401d70030925b6de2206e923070e0206ef2d0800044c87f01ca0055505056ce13ce810101cf0001c8810101cf0012f40012ca00cdc9ed548806d8ba');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initTAIMaster_init_args({ $$type: 'TAIMaster_init_args', owner, vesting })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const TAIMaster_errors = {
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
    10849: { message: "INVALID_AMOUNT" },
    17892: { message: "INSUFFICIENT" },
    26038: { message: "ALREADY_LOCKED" },
    47989: { message: "NOT_OWNER" },
} as const

export const TAIMaster_errors_backward = {
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
    "INVALID_AMOUNT": 10849,
    "INSUFFICIENT": 17892,
    "ALREADY_LOCKED": 26038,
    "NOT_OWNER": 47989,
} as const

const TAIMaster_types: ABIType[] = [
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
    {"name":"TransferLocked","header":4234368437,"fields":[]},
    {"name":"TransferTokens","header":3690960551,"fields":[{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"SupplySummary","header":null,"fields":[{"name":"total","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"locked","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"circulating","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"lockedTransferred","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"TAIMaster$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"vesting","type":{"kind":"simple","type":"address","optional":false}},{"name":"totalSupply","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"lockedSupply","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"balances","type":{"kind":"dict","key":"address","value":"int"}},{"name":"lockedMoved","type":{"kind":"simple","type":"bool","optional":false}}]},
]

const TAIMaster_opcodes = {
    "TransferLocked": 4234368437,
    "TransferTokens": 3690960551,
}

const TAIMaster_getters: ABIGetter[] = [
    {"name":"summary","methodId":77650,"arguments":[],"returnType":{"kind":"simple","type":"SupplySummary","optional":false}},
    {"name":"balanceOf","methodId":96915,"arguments":[{"name":"target","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
]

export const TAIMaster_getterMapping: { [key: string]: string } = {
    'summary': 'getSummary',
    'balanceOf': 'getBalanceOf',
}

const TAIMaster_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"empty"}},
    {"receiver":"internal","message":{"kind":"typed","type":"TransferLocked"}},
    {"receiver":"internal","message":{"kind":"typed","type":"TransferTokens"}},
]

export const TOTAL_SUPPLY = 100000000000n;
export const LOCKED_SUPPLY = 90000000000n;

export class TAIMaster implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = TAIMaster_errors_backward;
    public static readonly opcodes = TAIMaster_opcodes;
    
    static async init(owner: Address, vesting: Address) {
        return await TAIMaster_init(owner, vesting);
    }
    
    static async fromInit(owner: Address, vesting: Address) {
        const __gen_init = await TAIMaster_init(owner, vesting);
        const address = contractAddress(0, __gen_init);
        return new TAIMaster(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new TAIMaster(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  TAIMaster_types,
        getters: TAIMaster_getters,
        receivers: TAIMaster_receivers,
        errors: TAIMaster_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: null | TransferLocked | TransferTokens) {
        
        let body: Cell | null = null;
        if (message === null) {
            body = new Cell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'TransferLocked') {
            body = beginCell().store(storeTransferLocked(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'TransferTokens') {
            body = beginCell().store(storeTransferTokens(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getSummary(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('summary', builder.build())).stack;
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
    
}