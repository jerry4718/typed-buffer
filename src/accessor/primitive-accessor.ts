import { call } from "../utils/proto-fn.ts";
import * as TypedArray from "../primitive/typed-array.ts";
import { TypedArrayFactory, TypedArrayInstance } from "../primitive/typed-array.ts";
import { BigEndian, Endian, LittleEndian } from "../utils/endianness-util.ts";

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

export class PrimitiveAccessor<Item extends (number | bigint), Container extends TypedArrayInstance<Item, Container>> {
    public readonly BYTES_PER_DATA: number;

    constructor(
        public readonly get: (view: DataView, byteOffset: number, littleEndian?: boolean) => Item,
        public readonly set: (view: DataView, byteOffset: number, value: Item, littleEndian?: boolean) => void,
        public readonly container: TypedArrayFactory<Item, Container>,
    ) {
        this.BYTES_PER_DATA = container.BYTES_PER_ELEMENT;
    }

    read(view: DataView, byteOffset: number, endian: Endian) {
        return this.get(view, byteOffset, endian === LittleEndian);
    }

    write(view: DataView, byteOffset: number, value: Item, endian: Endian) {
        return this.set(view, byteOffset, value, endian === LittleEndian);
    }
}

export class PrimitiveEndianAccessor<Item extends (number | bigint), Container extends TypedArrayInstance<Item, Container>> {
    public readonly BYTES_PER_DATA: number;
    constructor(
        public readonly get: (view: DataView, byteOffset: number, littleEndian?: boolean) => Item,
        public readonly set: (view: DataView, byteOffset: number, value: Item, littleEndian?: boolean) => void,
        public readonly container: TypedArrayFactory<Item, Container>,
        public readonly endian: Endian,
    ) {
        this.BYTES_PER_DATA = container.BYTES_PER_ELEMENT;
    }

    read(view: DataView, byteOffset: number) {
        return this.get(view, byteOffset, this.endian === LittleEndian);
    }

    write(view: DataView, byteOffset: number, value: Item) {
        return this.set(view, byteOffset, value, this.endian === LittleEndian);
    }
}

function createAccessor<Item extends (number | bigint), Container extends TypedArrayInstance<Item, Container>>(
    get: (view: DataView, byteOffset: number, littleEndian?: boolean) => Item,
    set: (view: DataView, byteOffset: number, value: Item, littleEndian?: boolean) => void,
    container: TypedArrayFactory<Item, Container>,
): PrimitiveAccessor<Item, Container> {
    return new PrimitiveAccessor<Item, Container>(get, set, container);
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
