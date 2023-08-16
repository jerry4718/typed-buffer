import { isUndefined } from '../utils/type-util.ts';
import { BigEndian, Endian, LittleEndian } from '../common.ts';
import { BaseParser, ParserContext, ParserOptionComposable, ValueSpec } from './base-parser.ts';

type PrimitiveGetter<T> = (this: DataView, byteOffset: number, littleEndian?: boolean) => T
type PrimitiveSetter<T> = (this: DataView, byteOffset: number, value: T, littleEndian?: boolean) => void

type PrimitiveParserOption<T> = ParserOptionComposable & PrimitiveParserOptionRequired<T>;

interface PrimitiveParserOptionRequired<T> {
    byteSize: number,
    getter: PrimitiveGetter<T>,
    setter: PrimitiveSetter<T>,
}

function isLittleEndian(endian?: Endian): boolean {
    if (isUndefined(endian)) return false;
    if (endian === BigEndian) return false;
    return endian === LittleEndian;
}

export class PrimitiveParser<T> extends BaseParser<T> {
    private readonly byteSize: number;
    private readonly getter: PrimitiveGetter<T>;
    private readonly setter: PrimitiveSetter<T>;
    private readonly endian?: Endian;

    constructor(option: PrimitiveParserOption<T>) {
        super();
        this.byteSize = option.byteSize;
        this.getter = option.getter;
        this.setter = option.setter;
        this.endian = option.endian;
    }

    valueSpec(value: T, byteOffset: number) {
        return super.valueSpec(value, byteOffset, this.byteSize);
    }

    read(ctx: ParserContext<unknown>, byteOffset: number, option?: ParserOptionComposable): ValueSpec<T> {
        const littleEndian = isLittleEndian(this.endian || option?.endian);
        const value = this.getter.call(new DataView(ctx.buffer), byteOffset, littleEndian);
        return this.valueSpec(value, byteOffset);
    }

    write(ctx: ParserContext<unknown>, byteOffset: number, value: T, option?: ParserOptionComposable): ValueSpec<T> {
        const littleEndian = isLittleEndian(this.endian || option?.endian);
        this.setter.call(new DataView(ctx.buffer), byteOffset, value, littleEndian);
        return this.valueSpec(value, byteOffset);
    }
}

function compose<T>(basic: PrimitiveParserOptionRequired<T>, ...expand: Partial<ParserOptionComposable>[]) {
    return Object.assign({}, basic, ...expand) as PrimitiveParserOption<T>;
}

const {
    getInt8, setInt8, getUint8, setUint8,
    getInt16, setInt16, getUint16, setUint16,
    getInt32, setInt32, getUint32, setUint32,
    getFloat32, setFloat32, getFloat64, setFloat64,
    getBigInt64, setBigInt64, getBigUint64, setBigUint64,
} = DataView.prototype;

const composeLE: Pick<ParserOptionComposable, 'endian'> = { endian: 'le' };
const composeBE: Pick<ParserOptionComposable, 'endian'> = { endian: 'be' };

function cell<T>(
    byteSize: number,
    getter: PrimitiveGetter<T>,
    setter: PrimitiveSetter<T>,
): PrimitiveParserOptionRequired<T> {
    return { byteSize, getter, setter };
}

const basicInt8 = cell(1, getInt8, setInt8);
const basicUint8 = cell(1, getUint8, setUint8);
const basicInt16 = cell(2, getInt16, setInt16);
const basicUint16 = cell(2, getUint16, setUint16);
const basicInt32 = cell(4, getInt32, setInt32);
const basicUint32 = cell(4, getUint32, setUint32);
const basicFloat32 = cell(4, getFloat32, setFloat32);
const basicFloat64 = cell(8, getFloat64, setFloat64);
const basicBigInt64 = cell(8, getBigInt64, setBigInt64);
const basicBigUint64 = cell(8, getBigUint64, setBigUint64);

export const Int8 = new PrimitiveParser(compose(basicInt8));
export const Uint8 = new PrimitiveParser(compose(basicUint8));
export const Int16 = new PrimitiveParser(compose(basicInt16));
export const Uint16 = new PrimitiveParser(compose(basicUint16));
export const Int32 = new PrimitiveParser(compose(basicInt32));
export const Uint32 = new PrimitiveParser(compose(basicUint32));
export const Float32 = new PrimitiveParser(compose(basicFloat32));
export const Float64 = new PrimitiveParser(compose(basicFloat64));
export const BigInt64 = new PrimitiveParser(compose(basicBigInt64));
export const BigUint64 = new PrimitiveParser(compose(basicBigUint64));

export const Int16BE = new PrimitiveParser(compose(basicInt16, composeBE));
export const Uint16BE = new PrimitiveParser(compose(basicUint16, composeBE));
export const Int32BE = new PrimitiveParser(compose(basicInt32, composeBE));
export const Uint32BE = new PrimitiveParser(compose(basicUint32, composeBE));
export const Float32BE = new PrimitiveParser(compose(basicFloat32, composeBE));
export const Float64BE = new PrimitiveParser(compose(basicFloat64, composeBE));
export const BigInt64BE = new PrimitiveParser(compose(basicBigInt64, composeBE));
export const BigUint64BE = new PrimitiveParser(compose(basicBigUint64, composeBE));

export const Int16LE = new PrimitiveParser(compose(basicInt16, composeLE));
export const Uint16LE = new PrimitiveParser(compose(basicUint16, composeLE));
export const Int32LE = new PrimitiveParser(compose(basicInt32, composeLE));
export const Uint32LE = new PrimitiveParser(compose(basicUint32, composeLE));
export const Float32LE = new PrimitiveParser(compose(basicFloat32, composeLE));
export const Float64LE = new PrimitiveParser(compose(basicFloat64, composeLE));
export const BigInt64LE = new PrimitiveParser(compose(basicBigInt64, composeLE));
export const BigUint64LE = new PrimitiveParser(compose(basicBigUint64, composeLE));
