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

export type Stake = {
    $$type: 'Stake';
    amount: bigint;
}

export function storeStake(src: Stake) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1696574805, 32);
        b_0.storeInt(src.amount, 257);
    };
}

export function loadStake(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1696574805) { throw Error('Invalid prefix'); }
    const _amount = sc_0.loadIntBig(257);
    return { $$type: 'Stake' as const, amount: _amount };
}

export function loadTupleStake(source: TupleReader) {
    const _amount = source.readBigNumber();
    return { $$type: 'Stake' as const, amount: _amount };
}

export function loadGetterTupleStake(source: TupleReader) {
    const _amount = source.readBigNumber();
    return { $$type: 'Stake' as const, amount: _amount };
}

export function storeTupleStake(source: Stake) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    return builder.build();
}

export function dictValueParserStake(): DictionaryValue<Stake> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStake(src)).endCell());
        },
        parse: (src) => {
            return loadStake(src.loadRef().beginParse());
        }
    }
}

export type Unstake = {
    $$type: 'Unstake';
    amount: bigint;
}

export function storeUnstake(src: Unstake) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3125946401, 32);
        b_0.storeInt(src.amount, 257);
    };
}

export function loadUnstake(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3125946401) { throw Error('Invalid prefix'); }
    const _amount = sc_0.loadIntBig(257);
    return { $$type: 'Unstake' as const, amount: _amount };
}

export function loadTupleUnstake(source: TupleReader) {
    const _amount = source.readBigNumber();
    return { $$type: 'Unstake' as const, amount: _amount };
}

export function loadGetterTupleUnstake(source: TupleReader) {
    const _amount = source.readBigNumber();
    return { $$type: 'Unstake' as const, amount: _amount };
}

export function storeTupleUnstake(source: Unstake) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    return builder.build();
}

export function dictValueParserUnstake(): DictionaryValue<Unstake> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUnstake(src)).endCell());
        },
        parse: (src) => {
            return loadUnstake(src.loadRef().beginParse());
        }
    }
}

export type ClaimReward = {
    $$type: 'ClaimReward';
}

export function storeClaimReward(src: ClaimReward) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2151883269, 32);
    };
}

export function loadClaimReward(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2151883269) { throw Error('Invalid prefix'); }
    return { $$type: 'ClaimReward' as const };
}

export function loadTupleClaimReward(source: TupleReader) {
    return { $$type: 'ClaimReward' as const };
}

export function loadGetterTupleClaimReward(source: TupleReader) {
    return { $$type: 'ClaimReward' as const };
}

export function storeTupleClaimReward(source: ClaimReward) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserClaimReward(): DictionaryValue<ClaimReward> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeClaimReward(src)).endCell());
        },
        parse: (src) => {
            return loadClaimReward(src.loadRef().beginParse());
        }
    }
}

export type PauseStaker = {
    $$type: 'PauseStaker';
    target: Address;
    untilTs: bigint;
}

export function storePauseStaker(src: PauseStaker) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(545102078, 32);
        b_0.storeAddress(src.target);
        b_0.storeInt(src.untilTs, 257);
    };
}

export function loadPauseStaker(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 545102078) { throw Error('Invalid prefix'); }
    const _target = sc_0.loadAddress();
    const _untilTs = sc_0.loadIntBig(257);
    return { $$type: 'PauseStaker' as const, target: _target, untilTs: _untilTs };
}

export function loadTuplePauseStaker(source: TupleReader) {
    const _target = source.readAddress();
    const _untilTs = source.readBigNumber();
    return { $$type: 'PauseStaker' as const, target: _target, untilTs: _untilTs };
}

export function loadGetterTuplePauseStaker(source: TupleReader) {
    const _target = source.readAddress();
    const _untilTs = source.readBigNumber();
    return { $$type: 'PauseStaker' as const, target: _target, untilTs: _untilTs };
}

export function storeTuplePauseStaker(source: PauseStaker) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.target);
    builder.writeNumber(source.untilTs);
    return builder.build();
}

export function dictValueParserPauseStaker(): DictionaryValue<PauseStaker> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storePauseStaker(src)).endCell());
        },
        parse: (src) => {
            return loadPauseStaker(src.loadRef().beginParse());
        }
    }
}

export type ToggleEmergency = {
    $$type: 'ToggleEmergency';
    value: boolean;
}

export function storeToggleEmergency(src: ToggleEmergency) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1068767172, 32);
        b_0.storeBit(src.value);
    };
}

export function loadToggleEmergency(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1068767172) { throw Error('Invalid prefix'); }
    const _value = sc_0.loadBit();
    return { $$type: 'ToggleEmergency' as const, value: _value };
}

export function loadTupleToggleEmergency(source: TupleReader) {
    const _value = source.readBoolean();
    return { $$type: 'ToggleEmergency' as const, value: _value };
}

export function loadGetterTupleToggleEmergency(source: TupleReader) {
    const _value = source.readBoolean();
    return { $$type: 'ToggleEmergency' as const, value: _value };
}

export function storeTupleToggleEmergency(source: ToggleEmergency) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.value);
    return builder.build();
}

export function dictValueParserToggleEmergency(): DictionaryValue<ToggleEmergency> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeToggleEmergency(src)).endCell());
        },
        parse: (src) => {
            return loadToggleEmergency(src.loadRef().beginParse());
        }
    }
}

export type RecordParticipation = {
    $$type: 'RecordParticipation';
    target: Address;
    deltaPoints: bigint;
}

export function storeRecordParticipation(src: RecordParticipation) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2232415888, 32);
        b_0.storeAddress(src.target);
        b_0.storeInt(src.deltaPoints, 257);
    };
}

export function loadRecordParticipation(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2232415888) { throw Error('Invalid prefix'); }
    const _target = sc_0.loadAddress();
    const _deltaPoints = sc_0.loadIntBig(257);
    return { $$type: 'RecordParticipation' as const, target: _target, deltaPoints: _deltaPoints };
}

export function loadTupleRecordParticipation(source: TupleReader) {
    const _target = source.readAddress();
    const _deltaPoints = source.readBigNumber();
    return { $$type: 'RecordParticipation' as const, target: _target, deltaPoints: _deltaPoints };
}

export function loadGetterTupleRecordParticipation(source: TupleReader) {
    const _target = source.readAddress();
    const _deltaPoints = source.readBigNumber();
    return { $$type: 'RecordParticipation' as const, target: _target, deltaPoints: _deltaPoints };
}

export function storeTupleRecordParticipation(source: RecordParticipation) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.target);
    builder.writeNumber(source.deltaPoints);
    return builder.build();
}

export function dictValueParserRecordParticipation(): DictionaryValue<RecordParticipation> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRecordParticipation(src)).endCell());
        },
        parse: (src) => {
            return loadRecordParticipation(src.loadRef().beginParse());
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

export type SetPrediction = {
    $$type: 'SetPrediction';
    target: Address;
}

export function storeSetPrediction(src: SetPrediction) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1154094813, 32);
        b_0.storeAddress(src.target);
    };
}

export function loadSetPrediction(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1154094813) { throw Error('Invalid prefix'); }
    const _target = sc_0.loadAddress();
    return { $$type: 'SetPrediction' as const, target: _target };
}

export function loadTupleSetPrediction(source: TupleReader) {
    const _target = source.readAddress();
    return { $$type: 'SetPrediction' as const, target: _target };
}

export function loadGetterTupleSetPrediction(source: TupleReader) {
    const _target = source.readAddress();
    return { $$type: 'SetPrediction' as const, target: _target };
}

export function storeTupleSetPrediction(source: SetPrediction) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.target);
    return builder.build();
}

export function dictValueParserSetPrediction(): DictionaryValue<SetPrediction> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetPrediction(src)).endCell());
        },
        parse: (src) => {
            return loadSetPrediction(src.loadRef().beginParse());
        }
    }
}

export type StakeInfo = {
    $$type: 'StakeInfo';
    amount: bigint;
    accumulatedSeconds: bigint;
    lastUpdate: bigint;
    penaltyCount: bigint;
    pausedUntil: bigint;
    pendingReward: bigint;
    points: bigint;
}

export function storeStakeInfo(src: StakeInfo) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.amount, 257);
        b_0.storeInt(src.accumulatedSeconds, 257);
        b_0.storeInt(src.lastUpdate, 257);
        const b_1 = new Builder();
        b_1.storeInt(src.penaltyCount, 257);
        b_1.storeInt(src.pausedUntil, 257);
        b_1.storeInt(src.pendingReward, 257);
        const b_2 = new Builder();
        b_2.storeInt(src.points, 257);
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadStakeInfo(slice: Slice) {
    const sc_0 = slice;
    const _amount = sc_0.loadIntBig(257);
    const _accumulatedSeconds = sc_0.loadIntBig(257);
    const _lastUpdate = sc_0.loadIntBig(257);
    const sc_1 = sc_0.loadRef().beginParse();
    const _penaltyCount = sc_1.loadIntBig(257);
    const _pausedUntil = sc_1.loadIntBig(257);
    const _pendingReward = sc_1.loadIntBig(257);
    const sc_2 = sc_1.loadRef().beginParse();
    const _points = sc_2.loadIntBig(257);
    return { $$type: 'StakeInfo' as const, amount: _amount, accumulatedSeconds: _accumulatedSeconds, lastUpdate: _lastUpdate, penaltyCount: _penaltyCount, pausedUntil: _pausedUntil, pendingReward: _pendingReward, points: _points };
}

export function loadTupleStakeInfo(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _accumulatedSeconds = source.readBigNumber();
    const _lastUpdate = source.readBigNumber();
    const _penaltyCount = source.readBigNumber();
    const _pausedUntil = source.readBigNumber();
    const _pendingReward = source.readBigNumber();
    const _points = source.readBigNumber();
    return { $$type: 'StakeInfo' as const, amount: _amount, accumulatedSeconds: _accumulatedSeconds, lastUpdate: _lastUpdate, penaltyCount: _penaltyCount, pausedUntil: _pausedUntil, pendingReward: _pendingReward, points: _points };
}

export function loadGetterTupleStakeInfo(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _accumulatedSeconds = source.readBigNumber();
    const _lastUpdate = source.readBigNumber();
    const _penaltyCount = source.readBigNumber();
    const _pausedUntil = source.readBigNumber();
    const _pendingReward = source.readBigNumber();
    const _points = source.readBigNumber();
    return { $$type: 'StakeInfo' as const, amount: _amount, accumulatedSeconds: _accumulatedSeconds, lastUpdate: _lastUpdate, penaltyCount: _penaltyCount, pausedUntil: _pausedUntil, pendingReward: _pendingReward, points: _points };
}

export function storeTupleStakeInfo(source: StakeInfo) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    builder.writeNumber(source.accumulatedSeconds);
    builder.writeNumber(source.lastUpdate);
    builder.writeNumber(source.penaltyCount);
    builder.writeNumber(source.pausedUntil);
    builder.writeNumber(source.pendingReward);
    builder.writeNumber(source.points);
    return builder.build();
}

export function dictValueParserStakeInfo(): DictionaryValue<StakeInfo> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStakeInfo(src)).endCell());
        },
        parse: (src) => {
            return loadStakeInfo(src.loadRef().beginParse());
        }
    }
}

export type JurorStaking$Data = {
    $$type: 'JurorStaking$Data';
    admin: Address;
    prediction: Address;
    treasury: Address;
    emergencyPaused: boolean;
    totalStaked: bigint;
    stakes: Dictionary<Address, StakeInfo>;
    rewardCredits: Dictionary<Address, bigint>;
}

export function storeJurorStaking$Data(src: JurorStaking$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.admin);
        b_0.storeAddress(src.prediction);
        b_0.storeAddress(src.treasury);
        b_0.storeBit(src.emergencyPaused);
        const b_1 = new Builder();
        b_1.storeInt(src.totalStaked, 257);
        b_1.storeDict(src.stakes, Dictionary.Keys.Address(), dictValueParserStakeInfo());
        b_1.storeDict(src.rewardCredits, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
        b_0.storeRef(b_1.endCell());
    };
}

export function loadJurorStaking$Data(slice: Slice) {
    const sc_0 = slice;
    const _admin = sc_0.loadAddress();
    const _prediction = sc_0.loadAddress();
    const _treasury = sc_0.loadAddress();
    const _emergencyPaused = sc_0.loadBit();
    const sc_1 = sc_0.loadRef().beginParse();
    const _totalStaked = sc_1.loadIntBig(257);
    const _stakes = Dictionary.load(Dictionary.Keys.Address(), dictValueParserStakeInfo(), sc_1);
    const _rewardCredits = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_1);
    return { $$type: 'JurorStaking$Data' as const, admin: _admin, prediction: _prediction, treasury: _treasury, emergencyPaused: _emergencyPaused, totalStaked: _totalStaked, stakes: _stakes, rewardCredits: _rewardCredits };
}

export function loadTupleJurorStaking$Data(source: TupleReader) {
    const _admin = source.readAddress();
    const _prediction = source.readAddress();
    const _treasury = source.readAddress();
    const _emergencyPaused = source.readBoolean();
    const _totalStaked = source.readBigNumber();
    const _stakes = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserStakeInfo(), source.readCellOpt());
    const _rewardCredits = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    return { $$type: 'JurorStaking$Data' as const, admin: _admin, prediction: _prediction, treasury: _treasury, emergencyPaused: _emergencyPaused, totalStaked: _totalStaked, stakes: _stakes, rewardCredits: _rewardCredits };
}

export function loadGetterTupleJurorStaking$Data(source: TupleReader) {
    const _admin = source.readAddress();
    const _prediction = source.readAddress();
    const _treasury = source.readAddress();
    const _emergencyPaused = source.readBoolean();
    const _totalStaked = source.readBigNumber();
    const _stakes = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserStakeInfo(), source.readCellOpt());
    const _rewardCredits = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    return { $$type: 'JurorStaking$Data' as const, admin: _admin, prediction: _prediction, treasury: _treasury, emergencyPaused: _emergencyPaused, totalStaked: _totalStaked, stakes: _stakes, rewardCredits: _rewardCredits };
}

export function storeTupleJurorStaking$Data(source: JurorStaking$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.admin);
    builder.writeAddress(source.prediction);
    builder.writeAddress(source.treasury);
    builder.writeBoolean(source.emergencyPaused);
    builder.writeNumber(source.totalStaked);
    builder.writeCell(source.stakes.size > 0 ? beginCell().storeDictDirect(source.stakes, Dictionary.Keys.Address(), dictValueParserStakeInfo()).endCell() : null);
    builder.writeCell(source.rewardCredits.size > 0 ? beginCell().storeDictDirect(source.rewardCredits, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
    return builder.build();
}

export function dictValueParserJurorStaking$Data(): DictionaryValue<JurorStaking$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJurorStaking$Data(src)).endCell());
        },
        parse: (src) => {
            return loadJurorStaking$Data(src.loadRef().beginParse());
        }
    }
}

 type JurorStaking_init_args = {
    $$type: 'JurorStaking_init_args';
    admin: Address;
    prediction: Address;
    treasury: Address;
}

function initJurorStaking_init_args(src: JurorStaking_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.admin);
        b_0.storeAddress(src.prediction);
        b_0.storeAddress(src.treasury);
    };
}

async function JurorStaking_init(admin: Address, prediction: Address, treasury: Address) {
    const __code = Cell.fromHex('b5ee9c7241022a01000ad9000228ff008e88f4a413f4bcf2c80bed5320e303ed43d9011202016202030105a0003f22020158040f020120050c02014806080181affa76a268690000c70ffd207d207d2069006a00e8408080eb807a027a0218081b881b081a881a360bcffd207d207d202a9001e8ac383836b6f12a836d9e3638c007004481010b22028101014133f40a6fa19401d70030925b6de2206e923070e0206ef2d080020120090b01acaa97ed44d0d200018e1ffa40fa40fa40d200d401d0810101d700f404f4043010371036103510346c179ffa40fa40fa40552003d15870706d6de25506db3c6c71206e92306d99206ef2d0806f276f07e2206e92306dde0a009681010b230259f40b6fa192306ddf206e92306d8e35d0810101d700810101d700810101d700d401d0810101d700810101d700810101d700d430d0810101d700301047104610456c176f07e20180a85aed44d0d200018e1ffa40fa40fa40d200d401d0810101d700f404f4043010371036103510346c179ffa40fa40fa40552003d15870706d6de25506db3c6c710e0181b73d3da89a1a400031c3ff481f481f481a401a803a1020203ae01e809e80860206e206c206a2068d82f3ff481f481f480aa4007a2b0e0e0dadbc4aa0db678d8e300d0258556027db3c08db3c28aa027aa904018064a904a008a7328064a9045380bc91389130e227c100927038de55060e1000b481010b230259f40b6fa192306ddf206e92306d8e35d0810101d700810101d700810101d700d401d0810101d700810101d700810101d700d430d0810101d700301047104610456c176f07e2206e923070e0206ef2d0806f275f060181b8d84ed44d0d200018e1ffa40fa40fa40d200d401d0810101d700f404f4043010371036103510346c179ffa40fa40fa40552003d15870706d6de25506db3c6c7181001f081010b230259f40b6fa192306ddf206e92306d8e35d0810101d700810101d700810101d700d401d0810101d700810101d700810101d700d430d0810101d700301047104610456c176f07e2206e923070e0206ef2d0806f275f047003c2009632f82358a1019130e221c100927032de01a020c101923070e011000c82015180a90403f03001d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e1ffa40fa40fa40d200d401d0810101d700f404f4043010371036103510346c179ffa40fa40fa40552003d15870706d6de208925f08e07027d74920c21f953107d31f08de218210651fad55bae302218210ba522821bae3022113151804b05b06810101d700301056104510344137db3c816f1428812710bef2f4f842556027db3c547654547654260d11140d0c11130c0b11120b0a11110a09111009108f107edb3c51dfa0502fa0105e104b103a498081010b5087c816251b1400d255605067810101cf0014810101cf0012810101cf0001c8810101cf0012810101cf0012810101cf0002c8810101cf0012cdcdc94180206e953059f45930944133f413e21035440302c87f01ca0055605067ce14ce12ceca0001c8810101cf0012f40012f400cdc9ed5404d05b06810101d700301056104510344137db3cf842556027db3c547654547654260d11140d0c11130c0b11120b0a11110a09111009108f107edb3c810c2e5610c200f2f48200b4c556102fbbf2f451dfa1512fa122943bf8230bdf1025104c103b4a9081010b5098c816251b1700108200f8dd24b3f2f401e655605067810101cf0014810101cf0012810101cf0001c8810101cf0012810101cf0012810101cf0002c8810101cf0012cdcdc944405290206e953059f45930944133f413e21028103710565033044515db3cc87f01ca0055605067ce14ce12ceca0001c8810101cf0012f40012f400cdc9ed542604bc821080432205bae302218210207d98febae3022182103fb417c4ba8eb85b06d200301056104510344137db3c3310561045103458c87f01ca0055605067ce14ce12ceca0001c8810101cf0012f40012f400cdc9ed54e0218210850ff690ba191c291d01fe5b36f8422681010b2259f40b6fa192306ddf206e92306d8e35d0810101d700810101d700810101d700d401d0810101d700810101d700810101d700d430d0810101d700301047104610456c176f07e2812f66216eb3f2f4206ef2d0806f27547654547654260d11130d0c11120c0b11110b0a11100a109f08111408071115071a03c2db3c8172a82ec200f2f4104c103b4a987081010b1110c855605067810101cf0014810101cf0012810101cf0001c8810101cf0012810101cf0012810101cf0002c8810101cf0012cdcdc945a05230206e953059f45930944133f413e2030807db3c1b261e002a10265f0620c2009a8200907ff82358bef2f49130e203c65b06fa40810101d700305078db3c27db3c3281010b4f1fc855605067810101cf0014810101cf0012810101cf0001c8810101cf0012810101cf0012810101cf0002c8810101cf0012cdcdc910234980206e953059f45930944133f413e210461035440329251e04e08fe55b06fa40810101d700305078db3c27db3c500fa081010b50ffc855605067810101cf0014810101cf0012810101cf0001c8810101cf0012810101cf0012810101cf0002c8810101cf0012cdcdc910234980206e953059f45930944133f413e2104610354403e0218210115fe710ba29251e1f0042c87f01ca0055605067ce14ce12ceca0001c8810101cf0012f40012f400cdc9ed5404f68f665b06810101d70031810101d700f404305078db3c07c1018e24375514c87f01ca0055605067ce14ce12ceca0001c8810101cf0012f40012f400cdc9ed54e0105755147fdb3cc87f01ca0055605067ce14ce12ceca0001c8810101cf0012f40012f400cdc9ed54e0218210993b56b1bae30221821044ca16ddba2122202802765b06810101d70031f404301056104510344137db3c550670db3cc87f01ca0055605067ce14ce12ceca0001c8810101cf0012f40012f400cdc9ed54212200168200a2eff84227c705f2f40142216e915be001206ef2d080d0fa40810101d700f4043021c200926c21e30d01f01f2302d0238edb106a1059104810374a982adb3c1110a081010b1110c855605067810101cf0014810101cf0012810101cf0001c8810101cf0012810101cf0012810101cf0002c8810101cf0012cdcdc910234ab0206e953059f45930944133f413e2e30e1048103746134454252403e8106a1059104810374a982adb3c111026b60820c2008e9d5166a103a45196a12b108e107d06105b1410394ecddb3c106c555510459130e281010b1110c855605067810101cf0014810101cf0012810101cf0001c8810101cf0012810101cf0012810101cf0002c8810101cf0012cdcdc910234ab025262700ea81010b230259f40b6fa192306ddf206e92306d8e35d0810101d700810101d700810101d700d401d0810101d700810101d700810101d700d430d0810101d700301047104610456c176f07e2206e99307020f82354711120e0206ef2d0806f27f82327c200935305bc9170e2965206a116a0059135e2008c20c101915be02281010b238101014133f40a6fa19401d70030925b6de25c6eb39830206ef2d08001a0926c21e281010b59810101216e955b59f4593098c801cf004133f441e2001c206e953059f45930944133f413e201da8eb55b06fa40301056104510344137db3c3510565503c87f01ca0055605067ce14ce12ceca0001c8810101cf0012f40012f400cdc9ed54e038c00007c12117b08e2510465513c87f01ca0055605067ce14ce12ceca0001c8810101cf0012f40012f400cdc9ed54e05f07f2c0822900168200b35df84228c705f2f4af8dbe43');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initJurorStaking_init_args({ $$type: 'JurorStaking_init_args', admin, prediction, treasury })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const JurorStaking_errors = {
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
    3118: { message: "AMOUNT_ZERO" },
    12134: { message: "NO_STAKE" },
    28436: { message: "STAKE_TOO_SMALL" },
    29352: { message: "NO_REWARD" },
    36991: { message: "SUSPENDED" },
    41711: { message: "NOT_PREDICTION" },
    45917: { message: "NOT_ADMIN" },
    46277: { message: "INSUFFICIENT_STAKE" },
    63709: { message: "EMERGENCY" },
} as const

export const JurorStaking_errors_backward = {
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
    "AMOUNT_ZERO": 3118,
    "NO_STAKE": 12134,
    "STAKE_TOO_SMALL": 28436,
    "NO_REWARD": 29352,
    "SUSPENDED": 36991,
    "NOT_PREDICTION": 41711,
    "NOT_ADMIN": 45917,
    "INSUFFICIENT_STAKE": 46277,
    "EMERGENCY": 63709,
} as const

const JurorStaking_types: ABIType[] = [
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
    {"name":"Stake","header":1696574805,"fields":[{"name":"amount","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"Unstake","header":3125946401,"fields":[{"name":"amount","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"ClaimReward","header":2151883269,"fields":[]},
    {"name":"PauseStaker","header":545102078,"fields":[{"name":"target","type":{"kind":"simple","type":"address","optional":false}},{"name":"untilTs","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"ToggleEmergency","header":1068767172,"fields":[{"name":"value","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"RecordParticipation","header":2232415888,"fields":[{"name":"target","type":{"kind":"simple","type":"address","optional":false}},{"name":"deltaPoints","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"CreditRewards","header":291497744,"fields":[{"name":"marketId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"reward","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"payouts","type":{"kind":"simple","type":"cell","optional":true}}]},
    {"name":"ApplySlash","header":2570802865,"fields":[{"name":"marketId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"entries","type":{"kind":"simple","type":"cell","optional":true}}]},
    {"name":"SetPrediction","header":1154094813,"fields":[{"name":"target","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"StakeInfo","header":null,"fields":[{"name":"amount","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"accumulatedSeconds","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"lastUpdate","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"penaltyCount","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"pausedUntil","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"pendingReward","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"points","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"JurorStaking$Data","header":null,"fields":[{"name":"admin","type":{"kind":"simple","type":"address","optional":false}},{"name":"prediction","type":{"kind":"simple","type":"address","optional":false}},{"name":"treasury","type":{"kind":"simple","type":"address","optional":false}},{"name":"emergencyPaused","type":{"kind":"simple","type":"bool","optional":false}},{"name":"totalStaked","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"stakes","type":{"kind":"dict","key":"address","value":"StakeInfo","valueFormat":"ref"}},{"name":"rewardCredits","type":{"kind":"dict","key":"address","value":"int"}}]},
]

const JurorStaking_opcodes = {
    "Stake": 1696574805,
    "Unstake": 3125946401,
    "ClaimReward": 2151883269,
    "PauseStaker": 545102078,
    "ToggleEmergency": 1068767172,
    "RecordParticipation": 2232415888,
    "CreditRewards": 291497744,
    "ApplySlash": 2570802865,
    "SetPrediction": 1154094813,
}

const JurorStaking_getters: ABIGetter[] = [
    {"name":"stakeOf","methodId":101015,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"StakeInfo","optional":true}},
    {"name":"stakeAmountOf","methodId":101466,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"stakeDaysOf","methodId":118148,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"whitelistQuotaOf","methodId":113129,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"rewardCreditOf","methodId":100340,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
]

export const JurorStaking_getterMapping: { [key: string]: string } = {
    'stakeOf': 'getStakeOf',
    'stakeAmountOf': 'getStakeAmountOf',
    'stakeDaysOf': 'getStakeDaysOf',
    'whitelistQuotaOf': 'getWhitelistQuotaOf',
    'rewardCreditOf': 'getRewardCreditOf',
}

const JurorStaking_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"empty"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Stake"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Unstake"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ClaimReward"}},
    {"receiver":"internal","message":{"kind":"typed","type":"PauseStaker"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ToggleEmergency"}},
    {"receiver":"internal","message":{"kind":"typed","type":"RecordParticipation"}},
    {"receiver":"internal","message":{"kind":"typed","type":"CreditRewards"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ApplySlash"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetPrediction"}},
]

export const MIN_STAKE_AMOUNT = 10000n;
export const DAY_SECONDS = 86400n;
export const QUOTA_CAP_RATIO_NUM = 50n;
export const QUOTA_CAP_RATIO_DEN = 100n;
export const QUOTA_AMOUNT_NUM = 8n;
export const QUOTA_AMOUNT_DEN = 10n;
export const QUOTA_DAYS_NUM = 1n;
export const QUOTA_DAYS_DEN = 100n;

export class JurorStaking implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = JurorStaking_errors_backward;
    public static readonly opcodes = JurorStaking_opcodes;
    
    static async init(admin: Address, prediction: Address, treasury: Address) {
        return await JurorStaking_init(admin, prediction, treasury);
    }
    
    static async fromInit(admin: Address, prediction: Address, treasury: Address) {
        const __gen_init = await JurorStaking_init(admin, prediction, treasury);
        const address = contractAddress(0, __gen_init);
        return new JurorStaking(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new JurorStaking(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  JurorStaking_types,
        getters: JurorStaking_getters,
        receivers: JurorStaking_receivers,
        errors: JurorStaking_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: null | Stake | Unstake | ClaimReward | PauseStaker | ToggleEmergency | RecordParticipation | CreditRewards | ApplySlash | SetPrediction) {
        
        let body: Cell | null = null;
        if (message === null) {
            body = new Cell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Stake') {
            body = beginCell().store(storeStake(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Unstake') {
            body = beginCell().store(storeUnstake(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ClaimReward') {
            body = beginCell().store(storeClaimReward(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'PauseStaker') {
            body = beginCell().store(storePauseStaker(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ToggleEmergency') {
            body = beginCell().store(storeToggleEmergency(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'RecordParticipation') {
            body = beginCell().store(storeRecordParticipation(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'CreditRewards') {
            body = beginCell().store(storeCreditRewards(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ApplySlash') {
            body = beginCell().store(storeApplySlash(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetPrediction') {
            body = beginCell().store(storeSetPrediction(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getStakeOf(provider: ContractProvider, user: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(user);
        const source = (await provider.get('stakeOf', builder.build())).stack;
        const result_p = source.readTupleOpt();
        const result = result_p ? loadTupleStakeInfo(result_p) : null;
        return result;
    }
    
    async getStakeAmountOf(provider: ContractProvider, user: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(user);
        const source = (await provider.get('stakeAmountOf', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getStakeDaysOf(provider: ContractProvider, user: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(user);
        const source = (await provider.get('stakeDaysOf', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getWhitelistQuotaOf(provider: ContractProvider, user: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(user);
        const source = (await provider.get('whitelistQuotaOf', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getRewardCreditOf(provider: ContractProvider, user: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(user);
        const source = (await provider.get('rewardCreditOf', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
}