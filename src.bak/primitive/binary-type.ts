import * as BinaryFlag from './binary-flag.ts';

export const u8 = BinaryFlag.Len8;
export const i8 = u8 | BinaryFlag.Signed;

export const u16 = BinaryFlag.Len16;
export const i16 = u16 | BinaryFlag.Signed;
export const i16be = i16 | BinaryFlag.Endian;
export const u16be = u16 | BinaryFlag.Endian;
export const i16le = i16be | BinaryFlag.LE;
export const u16le = u16be | BinaryFlag.LE;

export const u32 = BinaryFlag.Len32;
export const i32 = u32 | BinaryFlag.Signed;
export const i32be = i32 | BinaryFlag.Endian;
export const u32be = u32 | BinaryFlag.Endian;
export const i32le = i32be | BinaryFlag.LE;
export const u32le = u32be | BinaryFlag.LE;

export const u64 = BinaryFlag.Len64;
export const i64 = u64 | BinaryFlag.Signed;
export const i64be = i64 | BinaryFlag.Endian;
export const u64be = u64 | BinaryFlag.Endian;
export const i64le = i64be | BinaryFlag.LE;
export const u64le = u64be | BinaryFlag.LE;

export const f32 = BinaryFlag.Len64 | BinaryFlag.Float;
export const f32be = f32 | BinaryFlag.Endian;
export const f32le = f32be | BinaryFlag.LE;

export const f64 = BinaryFlag.Len64 | BinaryFlag.Float;
export const f64be = f64 | BinaryFlag.Endian;
export const f64le = f64be | BinaryFlag.LE;

export const UInt8 = u8;
export const Int8 = i8;
export const UInt16 = u16;
export const Int16 = i16;
export const Int16BE = i16be;
export const UInt16BE = u16be;
export const Int16LE = i16le;
export const UInt16LE = u16le;
export const UInt32 = u32;
export const Int32 = i32;
export const Int32BE = i32be;
export const UInt32BE = u32be;
export const Int32LE = i32le;
export const UInt32LE = u32le;
export const UInt64 = u64;
export const Int64 = i64;
export const Int64BE = i64be;
export const UInt64BE = u64be;
export const Int64LE = i64le;
export const UInt64LE = u64le;
export const Float32 = f32;
export const Float32BE = f32be;
export const Float32LE = f32le;
export const Float64 = f64;
export const Float64BE = f64be;
export const Float64LE = f64le;
