import { BigEndian, Endian, LittleEndian } from '../common.ts';
import { BaseParser, BaseParserConfig } from '../context/base-parser.ts';
import { ParserContext } from '../context/types.ts';
import { isUndefined } from '../utils/type-util.ts';

type PrimitiveGetter<T> = (this: DataView, byteOffset: number, littleEndian?: boolean) => T
type PrimitiveSetter<T> = (this: DataView, byteOffset: number, value: T, littleEndian?: boolean) => void

interface PrimitiveParserOptionRequired<T> {
    byteSize: number,
    getter: PrimitiveGetter<T>,
    setter: PrimitiveSetter<T>,
}

interface PrimitiveParserOptionComposable {
    endian?: Endian,
}

type PrimitiveParserConfig<T> =
    & BaseParserConfig
    & PrimitiveParserOptionComposable
    & PrimitiveParserOptionRequired<T>;

function isLittleEndian(endian?: Endian): boolean {
    if (isUndefined(endian)) throw Error('endian loosed')
    if (endian === BigEndian) return false;
    if (endian === LittleEndian) return true;
    throw Error('endian only support "le" or "be"');
}

export class PrimitiveParser<T> extends BaseParser<T> {
    readonly byteSize: number;
    private readonly getter: PrimitiveGetter<T>;
    private readonly setter: PrimitiveSetter<T>;
    private readonly endian?: Endian;

    constructor(config: PrimitiveParserConfig<T>) {
        super(config);
        this.byteSize = config.byteSize;
        this.getter = config.getter;
        this.setter = config.setter;
        this.endian = config.endian;
    }

    read(ctx: ParserContext, byteOffset: number): T {
        const littleEndian = isLittleEndian(this.endian || ctx.option.endian);
        return this.getter.call(new DataView(ctx.buffer), byteOffset, littleEndian);
    }

    write(ctx: ParserContext, value: T, byteOffset: number): T {
        const littleEndian = isLittleEndian(this.endian || ctx.option.endian);
        this.setter.call(new DataView(ctx.buffer), byteOffset, value, littleEndian);
        return value;
    }
}

function compose<T>(basic: PrimitiveParserOptionRequired<T>, ...expand: Partial<PrimitiveParserOptionComposable>[]) {
    return Object.assign({}, basic, ...expand) as PrimitiveParserConfig<T>;
}

const {
    getInt8, setInt8, getUint8, setUint8,
    getInt16, setInt16, getUint16, setUint16,
    getInt32, setInt32, getUint32, setUint32,
    getFloat32, setFloat32, getFloat64, setFloat64,
    getBigInt64, setBigInt64, getBigUint64, setBigUint64,
} = DataView.prototype;

const composeLE: Pick<PrimitiveParserOptionComposable, 'endian'> = { endian: 'le' };
const composeBE: Pick<PrimitiveParserOptionComposable, 'endian'> = { endian: 'be' };

function cell<T>(
    byteSize: number,
    getter: PrimitiveGetter<T>,
    setter: PrimitiveSetter<T>,
): PrimitiveParserOptionRequired<T> {
    return { byteSize, getter, setter };
}

const
    basicInt8 = cell(1, getInt8, setInt8),
    basicUint8 = cell(1, getUint8, setUint8),
    basicInt16 = cell(2, getInt16, setInt16),
    basicUint16 = cell(2, getUint16, setUint16),
    basicInt32 = cell(4, getInt32, setInt32),
    basicUint32 = cell(4, getUint32, setUint32),
    basicFloat32 = cell(4, getFloat32, setFloat32),
    basicFloat64 = cell(8, getFloat64, setFloat64),
    basicBigInt64 = cell(8, getBigInt64, setBigInt64),
    basicBigUint64 = cell(8, getBigUint64, setBigUint64);

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
