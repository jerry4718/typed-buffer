import { Endian } from '../common.ts';

type Int = 'Int';
type Uint = 'Uint';
type Float = 'Float';
type BigInt = 'BigInt';
type BigUint = 'BigUint';

type TypeCase = Int | Uint | Float | BigInt | BigUint;

type CanBeLower<T extends string> = T | Lowercase<T>

type Alias<T extends string> =
    T extends Int ? ('i' | CanBeLower<T>)
    : T extends Uint ? ('u' | CanBeLower<T>)
    : T extends Float ? ('f' | CanBeLower<T>)
    : T extends BigInt ? ('bi' | CanBeLower<T>)
    : T extends BigUint ? ('bu' | CanBeLower<T>)
    : never

type WithEndian<T extends number> = T | `${T}${Endian}`

type SizeEndian<T extends string> =
    T extends Int ? 8 | WithEndian<16 | 32>
    : T extends Uint ? 8 | WithEndian<16 | 32>
    : T extends Float ? 32 | 64
    : T extends BigInt ? WithEndian<64>
    : T extends BigUint ? WithEndian<64>
    : never

type TypeSymbol<T extends string> = `${Alias<T>}${SizeEndian<T>}`

type TypeFace<T extends TypeCase> =
    T extends Int ? TypeSymbol<Int>
    : T extends Uint ? TypeSymbol<Uint>
    : T extends Float ? TypeSymbol<Float>
    : T extends BigInt ? TypeSymbol<BigInt>
    : T extends BigUint ? TypeSymbol<BigUint>
    : never

type Config<F = TypeFace<TypeCase>> =
    F extends `${string}${Endian}` ? { type: F }
    : F extends `${Alias<Float>}${string}` ? { type: F }
    : F extends `${Alias<Int | Uint>}8` ? { type: F }
    : F extends TypeFace<TypeCase> ? { type: F, endian?: Endian }
    : never

type ConfigArrayFace<F = TypeFace<TypeCase>> =
    F extends `${string}${Endian}` ? { type: `${F}[]` }
    : F extends `${Alias<Float>}${string}` ? { type: `${F}[]` }
    : F extends `${Alias<Int | Uint>}8` ? { type: `${F}[]` }
    : F extends TypeFace<TypeCase> ? { type: `${F}[]`, endian?: Endian }
    : never

const Regs = {
    isArray: /\[]$/,
    isInt: /^(Int|i)\d/i,
    isUint: /^(Uint|u)\d/i,
    isFloat: /^(Float|f)\d/i,
    isBigInt: /^(BigInt|bi)\d/i,
    isBigUint: /^(BigUint|bu)\d/i,
    isSize8: /[tiuf]8(|le|be)(|\[])$/,
    isSize16: /[tiuf]16(|le|be)(|\[])$/,
    isSize32: /[tiuf]32(|le|be)(|\[])$/,
    isSize64: /[tiuf]64(|le|be)(|\[])$/,
    hasEndian: /\d(be|le)(|\[])$/,
    isBe: /\dbe(|\[])$/,
    isLe: /\dle(|\[])$/
};

type RegKey = keyof typeof Regs;
type ParseResult = { [k in RegKey]: boolean };

function parseType(type: (Config | ConfigArrayFace)['type']) {
    const mark: Partial<ParseResult> = {}

    for (const key in Regs) {
        if (!Object.prototype.hasOwnProperty.call(Regs, key)) continue;
        const reg = Regs[key as RegKey];
        mark[key as RegKey] = reg.test(type);
    }

    return mark as ParseResult
}

console.log(parseType('bu64le[]'))
