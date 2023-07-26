const DEFINE_BYTE_SIZE = 1 << 2;
const DEFINE_BYTE_MAX = (1 << DEFINE_BYTE_SIZE) - 1;

export const Signed = 1 << 0;
export const Float = 1 << 1;
export const Endian = 1 << 2;
export const LE = 1 << 3;
export const Len8 = 1 << DEFINE_BYTE_SIZE << 0;
export const Len16 = 1 << DEFINE_BYTE_SIZE << 1;
export const Len32 = 1 << DEFINE_BYTE_SIZE << 2;
export const Len64 = 1 << DEFINE_BYTE_SIZE << 3;

const isZero = (mark: number) => mark === 0;
export const isNone = isZero;
export const validMark = (mark: number) => {
    if (isNone(mark)) return 0;
    const pow = Math.floor(Math.log2(mark >> DEFINE_BYTE_SIZE & DEFINE_BYTE_MAX));
    if (pow < 0) return 0;
    const head = mark & DEFINE_BYTE_MAX;
    return 1 << pow << DEFINE_BYTE_SIZE | head;
};

export const isSigned = (mark: number) => !isZero(Signed & validMark(mark));
export const isUnSigned = (mark: number) => !isSigned(mark);
export const isEndian = (mark: number) => !isZero(Endian & validMark(mark));
export const isFloat = (mark: number) => !isZero(Float & validMark(mark));
export const isInt = (mark: number) => !isFloat(mark);
export const isLe = (mark: number) => isEndian(mark) && !isZero(LE & validMark(mark));
export const isBe = (mark: number) => isEndian(mark) && isZero(LE & validMark(mark));
export const isLen8 = (mark: number) => !isZero(Len8 & validMark(mark));
export const isLen16 = (mark: number) => !isZero(Len16 & validMark(mark));
export const isLen32 = (mark: number) => !isZero(Len32 & validMark(mark));
export const isLen64 = (mark: number) => !isZero(Len64 & validMark(mark));

export const byteSize = (mark: number) => {
    return validMark(mark) >> DEFINE_BYTE_SIZE;
};
export const bitSize = (mark: number) => {
    return byteSize(mark) << 3;
};

export function flagInfo(mark: number) {
    return {
        bitSize: bitSize(mark),
        byteSize: byteSize(mark),
        isNone: isNone(mark),
        isSigned: isSigned(mark),
        isUnSigned: isUnSigned(mark),
        isInt: isInt(mark),
        isFloat: isFloat(mark),
        isEndian: isEndian(mark),
        isLe: isLe(mark),
        isBe: isBe(mark),
        isLen8: isLen8(mark),
        isLen16: isLen16(mark),
        isLen32: isLen32(mark),
        isLen64: isLen64(mark),
    };
}
