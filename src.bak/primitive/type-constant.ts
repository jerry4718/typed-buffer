import * as mask from './type-mask.ts';

/** define */
export const
    i8 = mask.Bit8 | mask.Int, u8 = i8 | mask.UnSigned,

    i16 = mask.Bit16 | mask.Int, u16 = i16 | mask.UnSigned,
    i16be = i16 | mask.BE, u16be = u16 | mask.BE,
    i16le = i16 | mask.LE, u16le = u16 | mask.LE,

    i32 = mask.Bit32 | mask.Int, u32 = i32 | mask.UnSigned,
    i32be = i32 | mask.BE, u32be = u32 | mask.BE,
    i32le = i32 | mask.LE, u32le = u32 | mask.LE,

    bi64 = mask.Bit64 | mask.Int, bu64 = bi64 | mask.UnSigned,
    bi64be = bi64 | mask.BE, bu64be = bu64 | mask.BE,
    bi64le = bi64 | mask.LE, bu64le = bu64 | mask.LE,

    f32 = mask.Bit32 | mask.Float,
    f32be = f32 | mask.BE,
    f32le = f32 | mask.LE,

    f64 = mask.Bit64 | mask.Float,
    f64be = f64 | mask.BE,
    f64le = f64 | mask.LE;

/** alias  */
export const
    Int8 = i8, UInt8 = u8,

    Int16 = i16, UInt16 = u16,
    Int16BE = i16be, UInt16BE = u16be,
    Int16LE = i16le, UInt16LE = u16le,

    Int32 = i32, UInt32 = u32,
    Int32BE = i32be, UInt32BE = u32be,
    Int32LE = i32le, UInt32LE = u32le,

    BigInt64 = bi64, BigUint64 = bu64,
    BigInt64BE = bi64be, BigUint64BE = bu64be,
    BigInt64LE = bi64le, BigUint64LE = bu64le,

    Float32 = f32,
    Float32BE = f32be,
    Float32LE = f32le,

    Float64 = f64,
    Float64LE = f64le,
    Float64BE = f64be;
