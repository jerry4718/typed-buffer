import * as BinaryFlags from '@/primitive/binary-flag'

type PrimitiveReader<T> = (this: DataView, byteOffset: number, littleEndian?: boolean) => T
type PrimitiveWriter<T> = (this: DataView, byteOffset: number, value: T, littleEndian?: boolean) => void

type TypeReader<T> = { get: (this: DataView, littleEndian: boolean, byteOffset: number) => T }
type TypeWriter<T> = { set: (this: DataView, littleEndian: boolean, byteOffset: number, value: T) => void }
type TypeExecutor<T> = TypeReader<T> & TypeWriter<T>
type PrimitiveExecutor<T> = TypeExecutor<T> & { size: number }

export namespace Primitive {
    const doNothing = () => void 0;

    function PrimitiveExecutor<T>(size: number, get: PrimitiveReader<T>, set: PrimitiveWriter<T>): PrimitiveExecutor<T> {
        return {
            size,
            get(this: DataView, littleEndian, byteOffset) {
                return get.call(this, byteOffset, littleEndian);
            },
            set(this: DataView, littleEndian, byteOffset, value) {
                return set.call(this, byteOffset, value, littleEndian);
            },
        };
    }

    export const None: PrimitiveExecutor<undefined> = PrimitiveExecutor(0, doNothing, doNothing);

    const {
        getInt8, setInt8, getUint8, setUint8,
        getInt16, setInt16, getUint16, setUint16,
        getInt32, setInt32, getUint32, setUint32,
        getFloat32, setFloat32, getFloat64, setFloat64,
        getBigInt64, setBigInt64, getBigUint64, setBigUint64,
    } = DataView.prototype;

    export const Int8: PrimitiveExecutor<number> = PrimitiveExecutor(1, getInt8, setInt8);
    export const UInt8: PrimitiveExecutor<number> = PrimitiveExecutor(1, getUint8, setUint8);
    export const Int16: PrimitiveExecutor<number> = PrimitiveExecutor(2, getInt16, setInt16);
    export const UInt16: PrimitiveExecutor<number> = PrimitiveExecutor(2, getUint16, setUint16);
    export const Int32: PrimitiveExecutor<number> = PrimitiveExecutor(4, getInt32, setInt32);
    export const UInt32: PrimitiveExecutor<number> = PrimitiveExecutor(4, getUint32, setUint32);
    export const Float32: PrimitiveExecutor<number> = PrimitiveExecutor(4, getFloat32, setFloat32);
    export const Float64: PrimitiveExecutor<number> = PrimitiveExecutor(8, getFloat64, setFloat64);
    export const Int64: PrimitiveExecutor<bigint> = PrimitiveExecutor(8, getBigInt64, setBigInt64);
    export const UInt64: PrimitiveExecutor<bigint> = PrimitiveExecutor(8, getBigUint64, setBigUint64);

    function dynamicStringReader(getLength: PrimitiveExecutor<number>, encoding: string = 'utf-8'): PrimitiveReader<string> {
        return function (this: DataView, byteOffset: number, littleEndian?: boolean): string {
            const length = getLength.get.call(this, littleEndian, byteOffset);

            // Skip the length information
            byteOffset += getLength.size;

            const bytes = new Uint8Array(this.buffer, this.byteOffset + byteOffset, length);
            const decoder = new TextDecoder(encoding);
            return decoder.decode(bytes);
        };
    }

    export function String(lengthType: TypeExecutor<number>) {
        return {};
    }

    export function Array<T>(type: TypeExecutor<T>): TypeExecutor<T[]> {
        const { get, set } = type;
        return {
            get(this: DataView, littleEndian: boolean, byteOffset: number) {
                return;
            },
            set(this: DataView, littleEndian, byteOffset, value) {
                return set.call(this, byteOffset, value, littleEndian);
            },
        };
    }
}

export enum PrimitiveSymbol {
    None = Symbol('None'),
    Int8 = Symbol('Int8'),
    UInt8 = Symbol('UInt8'),
    Int16 = Symbol('Int16'),
    UInt16 = Symbol('UInt16'),
    Int32 = Symbol('Int32'),
    UInt32 = Symbol('UInt32'),
    Float32 = Symbol('Float32'),
    Float64 = Symbol('Float64'),
    Int64 = Symbol('Int64'),
    UInt64 = Symbol('UInt64'),

    Int8LE = Symbol('Int8LE'),
    UInt8LE = Symbol('UInt8LE'),
    Int16LE = Symbol('Int16LE'),
    UInt16LE = Symbol('UInt16LE'),
    Int32LE = Symbol('Int32LE'),
    UInt32LE = Symbol('UInt32LE'),
    Float32LE = Symbol('Float32LE'),
    Float64LE = Symbol('Float64LE'),
    Int64LE = Symbol('Int64LE'),
    UInt64LE = Symbol('UInt64LE'),

    Int8BE = Symbol('Int8BE'),
    UInt8BE = Symbol('UInt8BE'),
    Int16BE = Symbol('Int16BE'),
    UInt16BE = Symbol('UInt16BE'),
    Int32BE = Symbol('Int32BE'),
    UInt32BE = Symbol('UInt32BE'),
    Float32BE = Symbol('Float32BE'),
    Float64BE = Symbol('Float64BE'),
    Int64BE = Symbol('Int64BE'),
    UInt64BE = Symbol('UInt64BE'),
}

export enum PrimitiveMark {
    None = 0,

    Int8 = BinaryFlags.Len8 | BinaryFlags.Signed,
    UInt8 = BinaryFlags.Len8,
    Int16 = BinaryFlags.Len16 | BinaryFlags.Signed,
    UInt16 = BinaryFlags.Len16,
    Int32 = BinaryFlags.Len32 | BinaryFlags.Signed,
    UInt32 = BinaryFlags.Len32,
    Float32 = BinaryFlags.Len32 | BinaryFlags.Float | BinaryFlags.Signed,
    Float64 = BinaryFlags.Len64 | BinaryFlags.Float | BinaryFlags.Signed,
    Int64 = BinaryFlags.Len64 | BinaryFlags.Signed,
    UInt64 = BinaryFlags.Len64,

    Int8BE = Int8 | BinaryFlags.Endian,
    UInt8BE = UInt8 | BinaryFlags.Endian,
    Int16BE = Int16 | BinaryFlags.Endian,
    UInt16BE = UInt16 | BinaryFlags.Endian,
    Int32BE = Int32 | BinaryFlags.Endian,
    UInt32BE = UInt32 | BinaryFlags.Endian,
    Float32BE = Float32 | BinaryFlags.Endian,
    Float64BE = Float64 | BinaryFlags.Endian,
    Int64BE = Int64 | BinaryFlags.Endian,
    UInt64BE = UInt64 | BinaryFlags.Endian,

    Int8LE = Int8BE | BinaryFlags.LE,
    UInt8LE = UInt8BE | BinaryFlags.LE,
    Int16LE = Int16BE | BinaryFlags.LE,
    UInt16LE = UInt16BE | BinaryFlags.LE,
    Int32LE = Int32BE | BinaryFlags.LE,
    UInt32LE = UInt32BE | BinaryFlags.LE,
    Float32LE = Float32BE | BinaryFlags.LE,
    Float64LE = Float64BE | BinaryFlags.LE,
    Int64LE = Int64BE | BinaryFlags.LE,
    UInt64LE = UInt64BE | BinaryFlags.LE,
}

type BinaryBaseConfig = {
    endian?: 'le' | 'be'
}

type BinarySpecItem = {
    name: string,
    type: PrimitiveMark | PrimitiveType
}

type BinarySpec = BinarySpecItem[]

function createFormatter(config: BinaryBaseConfig, spec) {


    function read(view: DataView) {

    }

    function write(view: DataView, data) {
    }

    return { read, write };
}

createFormatter({ endian: 'le' }, {});

type TypeSpec<T> = {
    executor: TypeExecutor<T>,
}

type DefineType<T> = (param: {}) => TypeSpec<T>

type Field<T> = { [K in keyof T]: { name: K, type: TypeSpec<T[K]> } }[keyof T]

type Spec0 = { name: string, age: number };

type Field0 = Field<Spec0>

type Field1 = Field<{ info: Spec0 }>

function defineType<T>(param: { fields: Field<T>[] }): TypeSpec<T> {
    return;
}

const Str16h = defineType({
    fields: [
        { name: 'length', type: Primitive.UInt16 },
        { name: 'data', type: Primitive.String((readed) => readed.length, 'ascii') },
    ],
});

const Str32h = defineType({
    fields: [
        { name: 'length', type: Primitive.UInt32 },
        { name: 'data', type: Primitive.String((readed) => readed.length, 'ascii') },
    ],
});

const Header = defineType({
    fields: [
        { name: 'name', type: Str16h }
        { name: 'version', type: Primitive.UInt8 },
        { name: 'bodyPosition', type: Primitive.UInt32 },
    ],
});

const BodyItem = defineType({
    fields: [
        { name: 'name', type: Str16h },
    ],
});

const Body = defineType({
    fields: [
        { name: 'name', type: Str32h },
        { name: 'items', type: BodyItem },
    ],
});

const File = defineType({
    fields: [
        { name: 'header', type: Header },
        { name: 'body', type: Body, start: (readed) => readed.header.bodyPosition },
    ],
});

function read(view: DataView, spec: typeof File) {

}
