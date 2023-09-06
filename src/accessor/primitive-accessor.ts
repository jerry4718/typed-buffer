import { call } from '../utils/proto-fn.ts';
import * as TypedArray from '../primitive/typed-array.ts';
import { TypedArrayFactory, TypedArrayInstance } from '../primitive/typed-array.ts';
import { BigEndian, Endian, LittleEndian } from '../utils/endianness-util.ts';
import { isUndefined } from '../utils/type-util.ts';

const dvp = DataView.prototype;

const
    getInt8 = call.bind(dvp.getInt8), setInt8 = call.bind(dvp.setInt8),
    getUint8 = call.bind(dvp.getUint8), setUint8 = call.bind(dvp.setUint8),
    getInt16 = call.bind(dvp.getInt16), setInt16 = call.bind(dvp.setInt16),
    getUint16 = call.bind(dvp.getUint16), setUint16 = call.bind(dvp.setUint16),
    getInt32 = call.bind(dvp.getInt32), setInt32 = call.bind(dvp.setInt32),
    getUint32 = call.bind(dvp.getUint32), setUint32 = call.bind(dvp.setUint32),
    getFloat32 = call.bind(dvp.getFloat32), setFloat32 = call.bind(dvp.setFloat32),
    getFloat64 = call.bind(dvp.getFloat64), setFloat64 = call.bind(dvp.setFloat64),
    getBigInt64 = call.bind(dvp.getBigInt64), setBigInt64 = call.bind(dvp.setBigInt64),
    getBigUint64 = call.bind(dvp.getBigUint64), setBigUint64 = call.bind(dvp.setBigUint64);

function wrapGet<Item extends (number | bigint)>(get: (view: DataView, byteOffset: number, littleEndian?: boolean) => Item)
    : (view: DataView, byteOffset: number, endian: Endian) => Item
function wrapGet<Item extends (number | bigint)>(get: (view: DataView, byteOffset: number, littleEndian?: boolean) => Item, endian: Endian)
    : (view: DataView, byteOffset: number) => Item
function wrapGet<Item extends (number | bigint)>(get: (view: DataView, byteOffset: number, littleEndian?: boolean) => Item, endian?: Endian) {
    if (isUndefined(endian)) return (view: DataView, byteOffset: number, endian: Endian) => get(view, byteOffset, endian === LittleEndian);
    return (view: DataView, byteOffset: number) => get(view, byteOffset, endian === LittleEndian);
}

function wrapSet<Item extends (number | bigint)>(set: (view: DataView, byteOffset: number, value: Item, littleEndian?: boolean) => void)
    : (view: DataView, byteOffset: number, value: Item, endian: Endian) => void
function wrapSet<Item extends (number | bigint)>(set: (view: DataView, byteOffset: number, value: Item, littleEndian?: boolean) => void, endian: Endian)
    : (view: DataView, byteOffset: number, value: Item) => void
function wrapSet<Item extends (number | bigint)>(set: (view: DataView, byteOffset: number, value: Item, littleEndian?: boolean) => void, endian?: Endian) {
    if (isUndefined(endian)) return (view: DataView, byteOffset: number, value: Item, endian: Endian) => set(view, byteOffset, value, endian === LittleEndian);
    return (view: DataView, byteOffset: number, value: Item) => set(view, byteOffset, value, endian === LittleEndian);
}

export class PrimitiveAccessor<Item extends (number | bigint), Container extends TypedArrayInstance<Item, Container>> {
    public get: (view: DataView, byteOffset: number, endian: Endian) => Item;
    public set: (view: DataView, byteOffset: number, value: Item, endian: Endian) => void;
    public container: TypedArrayFactory<Item, Container>;
    public readonly BYTES_PER_DATA: number;

    constructor(
        get: (view: DataView, byteOffset: number, littleEndian?: boolean) => Item,
        set: (view: DataView, byteOffset: number, value: Item, littleEndian?: boolean) => void,
        container: TypedArrayFactory<Item, Container>,
        endian?: Endian,
    ) {
        if (isUndefined(endian)) {
            this.get = wrapGet(get);
            this.set = wrapSet(set);
        } else {
            this.get = wrapGet(get, endian);
            this.set = wrapSet(set, endian);
        }
        this.container = container;
        this.BYTES_PER_DATA = container.BYTES_PER_ELEMENT;
    }
}

function createAccessor<Item extends (number | bigint), Container extends TypedArrayInstance<Item, Container>>(
    get: (view: DataView, byteOffset: number, littleEndian?: boolean) => Item,
    set: (view: DataView, byteOffset: number, value: Item, littleEndian?: boolean) => void,
    container: TypedArrayFactory<Item, Container>,
    endian?: Endian,
): PrimitiveAccessor<Item, Container> {
    return new PrimitiveAccessor<Item, Container>(get, set, container, endian);
}

function endianness<Item extends (number | bigint), Container extends TypedArrayInstance<Item, Container>>(base: PrimitiveAccessor<Item, Container>, endian: Endian) {
    return new PrimitiveEndianAccessor(base.get, base.set, base.container, endian);
}

export const
    Int8 = createAccessor(getInt8, setInt8, TypedArray.Int8Array),
    Uint8 = createAccessor(getUint8, setUint8, TypedArray.Uint8Array),
    Int16 = createAccessor(getInt16, setInt16, TypedArray.Int16Array),
    Uint16 = createAccessor(getUint16, setUint16, TypedArray.Uint16Array),
    Int32 = createAccessor(getInt32, setInt32, TypedArray.Int32Array),
    Uint32 = createAccessor(getUint32, setUint32, TypedArray.Uint32Array),
    Float32 = createAccessor(getFloat32, setFloat32, TypedArray.Float32Array),
    Float64 = createAccessor(getFloat64, setFloat64, TypedArray.Float64Array),
    BigInt64 = createAccessor(getBigInt64, setBigInt64, TypedArray.BigInt64Array),
    BigUint64 = createAccessor(getBigUint64, setBigUint64, TypedArray.BigUint64Array);

export const
    Int16LE = endianness(Int16, LittleEndian),
    Uint16LE = endianness(Uint16, LittleEndian),
    Int32LE = endianness(Int32, LittleEndian),
    Uint32LE = endianness(Uint32, LittleEndian),
    Float32LE = endianness(Float32, LittleEndian),
    Float64LE = endianness(Float64, LittleEndian),
    BigInt64LE = endianness(BigInt64, LittleEndian),
    BigUint64LE = endianness(BigUint64, LittleEndian);

export const
    Int16BE = endianness(Int16, BigEndian),
    Uint16BE = endianness(Uint16, BigEndian),
    Int32BE = endianness(Int32, BigEndian),
    Uint32BE = endianness(Uint32, BigEndian),
    Float32BE = endianness(Float32, BigEndian),
    Float64BE = endianness(Float64, BigEndian),
    BigInt64BE = endianness(BigInt64, BigEndian),
    BigUint64BE = endianness(BigUint64, BigEndian);
