import { BigEndian, LittleEndian } from '../common.ts';
import { TypedArrayConstructor, TypedArrayInstance } from '../describe/typed-array.ts';
import { changeTypedArrayEndianness, NATIVE_ENDIANNESS } from '../utils/endianness-util.ts';
import { call } from '../utils/proto-fn.ts';
import { isUndefined } from '../utils/type-util.ts';

const {
    getInt8, setInt8, getUint8, setUint8,
    getInt16, setInt16, getUint16, setUint16,
    getInt32, setInt32, getUint32, setUint32,
    getFloat32, setFloat32, getFloat64, setFloat64,
    getBigInt64, setBigInt64, getBigUint64, setBigUint64,
} = DataView.prototype;

export class TypedView {
    private buffer: ArrayBuffer;
    private view: DataView;

    constructor(buffer: ArrayBuffer, byteOffset: number, byteLength: number) {
        this.buffer = buffer;
        this.view = new DataView(buffer, byteOffset, byteLength);
    }
}

type View = Pick<
    DataView,
    | 'getInt8' | 'setInt8' | 'getUint8' | 'setUint8'
    | 'getInt16' | 'setInt16' | 'getUint16' | 'setUint16'
    | 'getInt32' | 'setInt32' | 'getUint32' | 'setUint32'
    | 'getFloat32' | 'setFloat32' | 'getFloat64' | 'setFloat64'
    | 'getBigInt64' | 'setBigInt64' | 'getBigUint64' | 'setBigUint64'
>

const
    readInt8 = call.bind(getInt8), writeInt8 = call.bind(setInt8),
    readUint8 = call.bind(getUint8), writeUint8 = call.bind(setUint8),
    readInt16 = call.bind(getInt16), writeInt16 = call.bind(setInt16),
    readUint16 = call.bind(getUint16), writeUint16 = call.bind(setUint16),
    readInt32 = call.bind(getInt32), writeInt32 = call.bind(setInt32),
    readUint32 = call.bind(getUint32), writeUint32 = call.bind(setUint32),
    readFloat32 = call.bind(getFloat32), writeFloat32 = call.bind(setFloat32),
    readFloat64 = call.bind(getFloat64), writeFloat64 = call.bind(setFloat64),
    readBigInt64 = call.bind(getBigInt64), writeBigInt64 = call.bind(setBigInt64),
    readBigUint64 = call.bind(getBigUint64), writeBigUint64 = call.bind(setBigUint64);

type TypedArrayLengthSizer = { length: number }
type TypedArrayByteLengthSizer = { byteLength: number }
type TypedArraySizer =
    | TypedArrayLengthSizer
    | TypedArrayByteLengthSizer
    | (TypedArrayLengthSizer & TypedArrayByteLengthSizer)

function resolveByteLength(sizer: TypedArraySizer, bytePerElement: number) {
    const { length, byteLength } = sizer as Partial<TypedArrayLengthSizer & TypedArrayByteLengthSizer>;
    const lengthDefined = !isUndefined(length);
    const byteLengthDefined = !isUndefined(byteLength);
    if (lengthDefined && byteLengthDefined && length * bytePerElement !== byteLength) {
        throw Error('argument `byteLength` dose not matched with `length`');
    }

    return byteLengthDefined ? byteLength : length * bytePerElement;
}

function resolveTypedArray<Item, Instance>(typedArray: TypedArrayInstance<Item, Instance>, littleEndian?: boolean) {
    if (littleEndian && NATIVE_ENDIANNESS === LittleEndian) {
        return typedArray;
    }
    if (!littleEndian && NATIVE_ENDIANNESS === BigEndian) {
        return typedArray;
    }
    return changeTypedArrayEndianness(typedArray);
}

function createTypedArrayView<Item, Instance>(this: DataView, TypedArrayClass: TypedArrayConstructor<Item, Instance>) {

    function read(byteOffset: number, sizer: TypedArraySizer, littleEndian?: boolean) {
        const byteLength = resolveByteLength(sizer, TypedArrayClass.BYTES_PER_ELEMENT);
        const typedArray = new TypedArrayClass(this.buffer, byteOffset, byteLength);
        return resolveTypedArray(typedArray);
    }

    function write(byteOffset: number, value: TypedArrayInstance<Item, Instance>, littleEndian?: boolean) {
        const typedArray = resolveTypedArray(value);

        // todo: do write
    }
}

export class TypedReader implements View {
    private buffer: ArrayBuffer;
    private view: DataView;

    private byteOffset: number;
    private readSize: number;

    getInt8;
    getUint8;
    getInt16;
    getUint16;
    getInt32;
    getUint32;
    getFloat32;
    getFloat64;
    getBigInt64;
    getBigUint64;
}

export class TypedArrayReader {
    private buffer: ArrayBuffer;
    private view: DataView;

    private byteOffset: number;
    private readSize: number;

    getInt8Array;
    getUint8Array;
    getInt16Array;
    getUint16Array;
    getInt32Array;
    getUint32Array;
    getFloat32Array;
    getFloat64Array;
    getBigInt64Array;
    getBigUint64Array;
}

export class TypedWriter {
    private buffer: ArrayBuffer;
    private view: DataView;

    private byteOffset: number;
    private writeSize: number;

    setInt8;
    setUint8;
    setInt16;
    setUint16;
    setInt32;
    setUint32;
    setFloat32;
    setFloat64;
    setBigInt64;
    setBigUint64;
}

export class TypedArrayWriter {
    private buffer: ArrayBuffer;
    private view: DataView;

    private byteOffset: number;
    private writeSize: number;

    setInt8Array;
    setUint8Array;
    setInt16Array;
    setUint16Array;
    setInt32Array;
    setUint32Array;
    setFloat32Array;
    setFloat64Array;
    setBigInt64Array;
    setBigUint64Array;
}
