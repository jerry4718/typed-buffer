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
export {
    i8 as Int8, u8 as Uint8,

    i16 as Int16, u16 as Uint16,
    i16be as Int16BE, u16be as Uint16BE,
    i16le as Int16LE, u16le as Uint16LE,

    i32 as Int32, u32 as Uint32,
    i32be as Int32BE, u32be as Uint32BE,
    i32le as Int32LE, u32le as Uint32LE,

    bi64 as BigInt64, bu64 as BigUint64,
    bi64be as BigInt64BE, bu64be as BigUint64BE,
    bi64le as BigInt64LE, bu64le as BigUint64LE,

    f32 as Float32,
    f32be as Float32BE,
    f32le as Float32LE,

    f64 as Float64,
    f64le as Float64LE,
    f64be as Float64BE
}
