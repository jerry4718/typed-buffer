export const
    posUnSigned = 0,
    posInt = 1,
    posFloat = 2,
    posBigInt = 3,
    posBE = 4,
    posLE = 5,
    posPow = 6;

export const
    UnSigned = (0b1 << posUnSigned),
    Int = (0b1 << posInt),
    Float = (0b1 << posFloat),
    BigInt = (0b1 << posBigInt),
    BE = (0b1 << posBE),
    LE = (0b1 << posLE),
    Pow = (0b11 << posPow);

export const
    Bit8 = (0b00 << posPow),
    Bit16 = (0b01 << posPow),
    Bit32 = (0b10 << posPow),
    Bit64 = (0b11 << posPow);

const isZero = (mask: number) => mask === 0;

export const
    isNone = isZero,
    isUnSigned = (mask: number) => !isZero(UnSigned & mask),
    isSigned = (mask: number) => !isUnSigned(mask),
    isInt = (mask: number) => !isZero(Int & mask),
    isFloat = (mask: number) => !isZero(Float & mask),
    isBigInt = (mask: number) => !isZero(BigInt & mask),
    isEndian = (mask: number) => !isZero((BE | LE) & mask),
    isLe = (mask: number) => !isZero(LE & mask),
    isBe = (mask: number) => !isZero(BE & mask);

export const
    byteSize = (mask: number) => Math.pow(2, (Pow & mask) >> posPow),
    bitSize = (mask: number) => byteSize(mask) << 3,
    isBit8 = (mask: number) => bitSize(mask) === 8,
    isBit16 = (mask: number) => bitSize(mask) === 16,
    isBit32 = (mask: number) => bitSize(mask) === 32,
    isBit64 = (mask: number) => bitSize(mask) === 64;

export function parseMark(mask: number) {
    return {
        isNone: isNone(mask),
        isSigned: isSigned(mask),
        isUnSigned: isUnSigned(mask),
        isInt: isInt(mask),
        isFloat: isFloat(mask),
        isBigInt: isBigInt(mask),
        isEndian: isEndian(mask),
        isLe: isLe(mask),
        isBe: isBe(mask),
        bitSize: bitSize(mask),
        byteSize: byteSize(mask),
        isBit8: isBit8(mask),
        isBit16: isBit16(mask),
        isBit32: isBit32(mask),
        isBit64: isBit64(mask),
    };
}
