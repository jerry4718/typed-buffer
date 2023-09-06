import { TypedArrayFactory, TypedArrayInstance } from '../primitive/typed-array.ts';
import { AbstractTypedArray } from './prototype-util.ts';
import { isUndefined } from './type-util.ts';

export const BigEndian = 'be' as const;
export const LittleEndian = 'le' as const;
export type Endian = typeof BigEndian | typeof LittleEndian;

// 探测当前运行环境的端序情况
export function getNativeEndianness(): Endian {
    const testBuffer = new ArrayBuffer(2);
    new Uint16Array(testBuffer).fill(0x0102);
    const [left, right] = new Uint8Array(testBuffer);
    if (left === 1 && right === 2) return BigEndian;
    if (left === 2 && right === 1) return LittleEndian;
    throw Error('never');
}

export const NATIVE_ENDIANNESS = getNativeEndianness();

export function isLittleEndian(endian?: Endian): boolean {
    if (isUndefined(endian)) throw Error('endian loosed');
    if (endian === BigEndian) return false;
    if (endian === LittleEndian) return true;
    throw Error('endian only support "le" or "be"');
}

export function changeTypedArrayEndianness<Item, Instance>(from: TypedArrayInstance<Item, Instance>): Instance {
    if (!(from instanceof AbstractTypedArray)) throw Error('Argument \'from\' is not TypedArray');
    const Constructor = from.constructor as TypedArrayFactory<Item, Instance>;

    if (from instanceof Uint8Array || from instanceof Int8Array) return new Constructor(from.buffer.slice(from.byteOffset, from.byteLength));

    const changedBuffer = new ArrayBuffer(from.byteLength);
    const changedUint8View = new Uint8Array(changedBuffer);

    const bytesPerElement = from.BYTES_PER_ELEMENT;
    for (let edx = 0; edx < from.length; edx++) {
        const start = from.byteOffset + edx * bytesPerElement;
        const element = new Uint8Array(from.buffer.slice(start, start + bytesPerElement));
        changedUint8View.set(element.reverse(), start);
    }

    return new Constructor(changedBuffer);
}
