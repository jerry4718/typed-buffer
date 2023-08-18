import {
    Int8, Uint8,
    Int16, Uint16, Int16BE, Uint16BE, Int16LE, Uint16LE,
    Int32, Uint32, Int32BE, Uint32BE, Int32LE, Uint32LE,
    BigInt64, BigUint64, BigInt64BE, BigUint64BE, BigInt64LE, BigUint64LE,
    Float32, Float32BE, Float32LE,
    Float64, Float64LE, Float64BE,
} from './type-constant.ts';

const array = Array.of(
    Int8, Uint8,
    Int16, Uint16, Int16BE, Uint16BE, Int16LE, Uint16LE,
    Int32, Uint32, Int32BE, Uint32BE, Int32LE, Uint32LE,
    BigInt64, BigUint64, BigInt64BE, BigUint64BE, BigInt64LE, BigUint64LE,
    Float32, Float32BE, Float32LE,
    Float64, Float64LE, Float64BE,
);

const set = new Set(array);

console.log(array.length === set.size);
