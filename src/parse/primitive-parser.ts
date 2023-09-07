import { BaseParser } from '../context/base-parser.ts';
import { ParserContext } from '../context/types.ts';
import { Endian, isLittleEndian } from '../utils/endianness-util.ts';
import { call } from "../utils/prototype-util.ts";
import * as TypedArray from '../utils/typed-array.ts';
import { TypedArrayFactory, TypedArrayInstance } from '../utils/typed-array.ts';

type PrimitiveGetter<T> = (view: DataView, byteOffset: number, littleEndian?: boolean) => T
type PrimitiveSetter<T> = (view: DataView, byteOffset: number, value: T, littleEndian?: boolean) => void

interface PrimitiveParserOptionRequired<Item extends (number | bigint), Container extends TypedArrayInstance<Item, Container>> {
    getter: PrimitiveGetter<Item>,
    setter: PrimitiveSetter<Item>,
    container: TypedArrayFactory<Item, Container>,
}

interface PrimitiveParserOptionComposable {
    endian?: Endian,
}

type PrimitiveParserConfig<Item extends (number | bigint), Container extends TypedArrayInstance<Item, Container>> =
    & PrimitiveParserOptionComposable
    & PrimitiveParserOptionRequired<Item, Container>;

export class PrimitiveParser<Item extends (number | bigint), Container extends TypedArrayInstance<Item, Container>> extends BaseParser<Item> {
    private readonly getter: PrimitiveGetter<Item>;
    private readonly setter: PrimitiveSetter<Item>;

    readonly container: TypedArrayFactory<Item,Container>;
    readonly bytesPerData: number;
    readonly endian?: Endian;

    constructor(config: PrimitiveParserConfig<Item, Container>) {
        super();
        this.getter = config.getter;
        this.setter = config.setter;
        this.container = config.container
        this.bytesPerData = config.container.BYTES_PER_ELEMENT;
        this.endian = config.endian;
    }

    read(ctx: ParserContext,byteOffset: number, endian?: Endian): Item {
        const littleEndian = isLittleEndian(this.endian || endian);
        return this.getter(ctx.view, byteOffset, littleEndian);
    }

    write(ctx: ParserContext, value: Item, byteOffset: number, endian?: Endian) {
        const littleEndian = isLittleEndian(this.endian || endian);
        this.setter(ctx.view, byteOffset, value, littleEndian);
    }
}

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

const composeLE: Pick<PrimitiveParserOptionComposable, 'endian'> = { endian: 'le' };
const composeBE: Pick<PrimitiveParserOptionComposable, 'endian'> = { endian: 'be' };

function cell<Item extends (number | bigint), Container extends TypedArrayInstance<Item, Container>>(
    getter: PrimitiveGetter<Item>,
    setter: PrimitiveSetter<Item>,
    container: TypedArrayFactory<Item,Container>,
): PrimitiveParserOptionRequired<Item,Container> {
    return { getter, setter, container };
}

function compose<Item extends (number | bigint), Container extends TypedArrayInstance<Item, Container>>(basic: PrimitiveParserOptionRequired<Item,Container>, ...expand: Partial<PrimitiveParserOptionComposable>[]) {
    return Object.assign({}, basic, ...expand) as PrimitiveParserConfig<Item,Container>;
}

const
    basicInt8 = cell(getInt8, setInt8, TypedArray.Int8Array),
    basicUint8 = cell(getUint8, setUint8, TypedArray.Uint8Array),
    basicInt16 = cell(getInt16, setInt16, TypedArray.Int16Array),
    basicUint16 = cell(getUint16, setUint16, TypedArray.Uint16Array),
    basicInt32 = cell(getInt32, setInt32, TypedArray.Int32Array),
    basicUint32 = cell(getUint32, setUint32, TypedArray.Uint32Array),
    basicFloat32 = cell(getFloat32, setFloat32, TypedArray.Float32Array),
    basicFloat64 = cell(getFloat64, setFloat64, TypedArray.Float64Array),
    basicBigInt64 = cell(getBigInt64, setBigInt64, TypedArray.BigInt64Array),
    basicBigUint64 = cell(getBigUint64, setBigUint64, TypedArray.BigUint64Array);

export const
    Int8 = new PrimitiveParser(compose(basicInt8)),
    Uint8 = new PrimitiveParser(compose(basicUint8)),
    Int16 = new PrimitiveParser(compose(basicInt16)),
    Uint16 = new PrimitiveParser(compose(basicUint16)),
    Int32 = new PrimitiveParser(compose(basicInt32)),
    Uint32 = new PrimitiveParser(compose(basicUint32)),
    Float32 = new PrimitiveParser(compose(basicFloat32)),
    Float64 = new PrimitiveParser(compose(basicFloat64)),
    BigInt64 = new PrimitiveParser(compose(basicBigInt64)),
    BigUint64 = new PrimitiveParser(compose(basicBigUint64));

export const
    Int16BE = new PrimitiveParser(compose(basicInt16, composeBE)),
    Uint16BE = new PrimitiveParser(compose(basicUint16, composeBE)),
    Int32BE = new PrimitiveParser(compose(basicInt32, composeBE)),
    Uint32BE = new PrimitiveParser(compose(basicUint32, composeBE)),
    Float32BE = new PrimitiveParser(compose(basicFloat32, composeBE)),
    Float64BE = new PrimitiveParser(compose(basicFloat64, composeBE)),
    BigInt64BE = new PrimitiveParser(compose(basicBigInt64, composeBE)),
    BigUint64BE = new PrimitiveParser(compose(basicBigUint64, composeBE));

export const
    Int16LE = new PrimitiveParser(compose(basicInt16, composeLE)),
    Uint16LE = new PrimitiveParser(compose(basicUint16, composeLE)),
    Int32LE = new PrimitiveParser(compose(basicInt32, composeLE)),
    Uint32LE = new PrimitiveParser(compose(basicUint32, composeLE)),
    Float32LE = new PrimitiveParser(compose(basicFloat32, composeLE)),
    Float64LE = new PrimitiveParser(compose(basicFloat64, composeLE)),
    BigInt64LE = new PrimitiveParser(compose(basicBigInt64, composeLE)),
    BigUint64LE = new PrimitiveParser(compose(basicBigUint64, composeLE));

export {
    Int8 as i8, Uint8 as u8,

    Int16 as i16, Uint16 as u16,
    Int16BE as i16be, Uint16BE as u16be,
    Int16LE as i16le, Uint16LE as u16le,

    Int32 as i32, Uint32 as u32,
    Int32BE as i32be, Uint32BE as u32be,
    Int32LE as i32le, Uint32LE as u32le,

    BigInt64 as bi64, BigUint64 as bu64,
    BigInt64BE as bi64be, BigUint64BE as bu64be,
    BigInt64LE as bi64le, BigUint64LE as bu64le,

    Float32 as f32,
    Float32BE as f32be,
    Float32LE as f32le,

    Float64 as f64,
    Float64LE as f64le,
    Float64BE as f64be,
};
