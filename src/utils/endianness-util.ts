import { isUndefined } from './type-util.ts';
import { TypedArrayConstructor, TypedArrayInstance } from '../describe/typed-array.ts';
import { AbstractTypedArray } from './prototype-util.ts';

export const BigEndian = 'be' as const;
export const LittleEndian = 'le' as const;
export type Endian = typeof BigEndian | typeof LittleEndian;

// 探测当前运行环境的端序情况
export function getNativeEndianness(): Endian {
    const testBuffer = new ArrayBuffer(2);
    new Uint16Array(testBuffer).fill(0x0102);
    const [ left, right ] = new Uint8Array(testBuffer);
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
    const Constructor: TypedArrayConstructor<Item, Instance> = from.constructor;

    if (from instanceof Uint8Array || from instanceof Int8Array) return Constructor.from(from);

    const fromUint8View = new Uint8Array(from.buffer, from.byteOffset, from.byteLength);

    const changedBuffer = new ArrayBuffer(from.byteLength);
    const changedTypedArray = new Constructor(changedBuffer);
    const changedUint8View = new Uint8Array(changedBuffer);

    const bytesPerElement = from.BYTES_PER_ELEMENT;
    for (let i = 0; i < from.length; i++) {
        const start = i * bytesPerElement;
        const element = Uint8Array.from(fromUint8View.slice(start, start + bytesPerElement));
        changedUint8View.set(element.reverse(), start);
    }

    return changedTypedArray;
}
