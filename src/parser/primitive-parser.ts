import { BaseParser, Endian, ParserContext, ParserOptionComposable, ValueSpec } from '@/parser/base-parser';

type PrimitiveGetter<T> = (this: DataView, byteOffset: number, littleEndian?: boolean) => T
type PrimitiveSetter<T> = (this: DataView, byteOffset: number, value: T, littleEndian?: boolean) => void

type PrimitiveParserOption<T> = ParserOptionComposable & PrimitiveParserOptionRequired<T>;

interface PrimitiveParserOptionRequired<T> {
    byteSize: number,
    getter: PrimitiveGetter<T>,
    setter: PrimitiveSetter<T>,
}

function isLittleEndian(endian: Endian): boolean {
    return endian === 'le';
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

    read(ctx: ParserContext<T>, byteOffset: number, option?: ParserOptionComposable): ValueSpec<T> {
        const littleEndian = isLittleEndian(this.endian || option.endian);
        const value = this.getter.call(new DataView(ctx.buffer), byteOffset, littleEndian);
        return this.valueSpec(value, byteOffset);
    }

    write(ctx: ParserContext<T>, byteOffset: number, value: number, option?: ParserOptionComposable): ValueSpec<T> {
        const littleEndian = isLittleEndian(this.endian || option.endian);
        this.setter.call(new DataView(ctx.buffer), byteOffset, value, littleEndian);
        return this.valueSpec(value, byteOffset);
    }
}

function compose<T>(base: PrimitiveParserOptionRequired<T>, ...expand: Partial<ParserOptionComposable>[]) {
    return Object.assign.apply(void 0, [ {}, base, ...expand ]) as PrimitiveParserOption<T>;
}

const {
    getInt8, setInt8, getUint8, setUint8,
    getInt16, setInt16, getUint16, setUint16,
    getInt32, setInt32, getUint32, setUint32,
    getFloat32, setFloat32, getFloat64, setFloat64,
    getBigInt64, setBigInt64, getBigUint64, setBigUint64,
} = DataView.prototype;

const cLE: Pick<ParserOptionComposable, 'endian'> = { endian: 'le' };
const cBE: Pick<ParserOptionComposable, 'endian'> = { endian: 'be' };

function cell<T>(
    byteSize: number,
    getter: PrimitiveGetter<T>,
    setter: PrimitiveSetter<T>,
): PrimitiveParserOptionRequired<T> {
    return { byteSize, getter, setter };
}

const cInt8 = cell(1, getInt8, setInt8);
const cUint8 = cell(1, getUint8, setUint8);
const cInt16 = cell(2, getInt16, setInt16);
const cUint16 = cell(2, getUint16, setUint16);
const cInt32 = cell(4, getInt32, setInt32);
const cUint32 = cell(4, getUint32, setUint32);
const cFloat32 = cell(4, getFloat32, setFloat32);
const cFloat64 = cell(8, getFloat64, setFloat64);
const cBigInt64 = cell(8, getBigInt64, setBigInt64);
const cBigUint64 = cell(8, getBigUint64, setBigUint64);

export const Int8 = new PrimitiveParser(compose(cInt8));
export const Uint8 = new PrimitiveParser(compose(cUint8));
export const Int16 = new PrimitiveParser(compose(cInt16));
export const Uint16 = new PrimitiveParser(compose(cUint16));
export const Int32 = new PrimitiveParser(compose(cInt32));
export const Uint32 = new PrimitiveParser(compose(cUint32));
export const Float32 = new PrimitiveParser(compose(cFloat32));
export const Float64 = new PrimitiveParser(compose(cFloat64));
export const BigInt64 = new PrimitiveParser(compose(cBigInt64));
export const BigUint64 = new PrimitiveParser(compose(cBigUint64));

export const Int16BE = new PrimitiveParser(compose(cInt16, cBE));
export const Uint16BE = new PrimitiveParser(compose(cUint16, cBE));
export const Int32BE = new PrimitiveParser(compose(cInt32, cBE));
export const Uint32BE = new PrimitiveParser(compose(cUint32, cBE));
export const Float32BE = new PrimitiveParser(compose(cFloat32, cBE));
export const Float64BE = new PrimitiveParser(compose(cFloat64, cBE));
export const BigInt64BE = new PrimitiveParser(compose(cBigInt64, cBE));
export const BigUint64BE = new PrimitiveParser(compose(cBigUint64, cBE));

export const Int16LE = new PrimitiveParser(compose(cInt16, cLE));
export const Uint16LE = new PrimitiveParser(compose(cUint16, cLE));
export const Int32LE = new PrimitiveParser(compose(cInt32, cLE));
export const Uint32LE = new PrimitiveParser(compose(cUint32, cLE));
export const Float32LE = new PrimitiveParser(compose(cFloat32, cLE));
export const Float64LE = new PrimitiveParser(compose(cFloat64, cLE));
export const BigInt64LE = new PrimitiveParser(compose(cBigInt64, cLE));
export const BigUint64LE = new PrimitiveParser(compose(cBigUint64, cLE));
