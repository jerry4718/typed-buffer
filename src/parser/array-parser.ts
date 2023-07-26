import { AdvancedParser, BaseParser, createContext, ParserContext, ParserOptionComposable, ValueSpec } from '@/parser/base-parser';
import {
    Float32, Float32BE, Float32LE, Float64, Float64BE, Float64LE, Int16, Int16BE, Int16LE, Int32, Int32BE, Int32LE, BigInt64, BigInt64BE, BigInt64LE, Int8, PrimitiveParser, Uint16,
    Uint16BE, Uint16LE, Uint32, Uint32BE, Uint32LE, BigUint64, BigUint64BE, BigUint64LE, Uint8,
} from '@/parser/primitive-parser';
import { assertType, isBoolean, isNumber, isObject, isUndefined } from '@/utils/type-util';

type OptionNumber<T> = ((ctx: ParserContext<T>) => number) | PrimitiveParser<number> | number;
type OptionEos<T> = ((ctx: ParserContext<T>) => number) | number | boolean;// 支持：1.指定结束于固定数字或者 2.根据下一个unit8判断

type BaseArrayParserOptionRequired<T> = { item: BaseParser<T> }
type BaseArrayParserOptionComputed<T> =
    | { count: OptionNumber<T> }
    | { size: OptionNumber<T> }
    | { eos: OptionEos<T> }
type BaseArrayParserOption<T> = BaseArrayParserOptionRequired<T> & BaseArrayParserOptionComputed<T>;

interface PrimitiveArrayConstructor<T, TArray> {
    new(length: number): TArray;

    new(array: ArrayLike<T> | ArrayBufferLike): TArray;

    new(buffer: ArrayBufferLike, byteOffset?: number, length?: number): TArray;

    of(...items: T[]): TArray;

    from(arrayLike: ArrayLike<T>): TArray;

    from<T>(arrayLike: ArrayLike<T>, convert: (v: T, k: number) => T, thisArg?: any): TArray;
}

const DEFAULT_EOS_FLAG = 0x00;
const eosFlag = (eos?: number) => !isUndefined(eos) ? eos : DEFAULT_EOS_FLAG;

export class BaseArrayParser<T> extends AdvancedParser<T[]> {
    private readonly itemParser?: BaseParser<T>;
    private readonly count?: OptionNumber<T>;
    private readonly size?: OptionNumber<T>;
    private readonly eos?: boolean | number | ((ctx: ParserContext<string>) => number);

    constructor(option: BaseArrayParserOption<T>) {
        super();
        const { item: itemParser, count, size, eos } = option;
        if (isUndefined(itemParser)) {
            throw new Error('Invalid parser options. Option [item] is required.');
        }
        if (Number(!isUndefined(count)) + Number(!isUndefined(size)) + Number(!isUndefined(eos)) !== 1) {
            throw new Error('Invalid parser options. Only one of [size] or [eos].');
        }
        this.itemParser = itemParser;
        this.count = count;
        this.size = size;
        this.eos = eos;
    }

    readOptionNumber(ctx: ParserContext<T, T[]>, option: OptionNumber<T>, byteOffset: number): ValueSpec<number> {
        if (isObject(option) && option instanceof PrimitiveParser && assertType<PrimitiveParser<number>>(option)) {
            return option.read(ctx, byteOffset);
        }
        if (typeof option === 'function' || typeof option === 'number') {
            const value = typeof option === 'number' ? option : option(ctx);
            return BaseParser.valueSpec(value, byteOffset, 0);
        }
        throw Error('one of NumberOption is not valid');
    }

    writeOptionNumber(ctx: ParserContext<T, T[]>, option: OptionNumber<T>, byteOffset: number, value: number): ValueSpec<number> {
        if (isObject(option) && option instanceof PrimitiveParser && assertType<PrimitiveParser<number>>(option)) {
            return option.write(ctx, byteOffset, value);
        }
        if (typeof option === 'function' || typeof option === 'number') {
            // const value = typeof size === 'number' ? size : size({});
            return BaseParser.valueSpec(value, byteOffset, 0);
        }
        throw Error('one of NumberOption is not valid');
    }

    eosJudge(ctx: ParserContext<T, T[]>, dataOffset: number, option?: ParserOptionComposable): boolean {
        const eos = this.eos;
        const { value: nextUInt8 } = Uint8.read(ctx, dataOffset);
        if (isBoolean(eos)) return nextUInt8 === eosFlag(option.eos);
        if (isNumber(eos)) return nextUInt8 === eos;
        return nextUInt8 === eos(ctx);
    }

    eosMark(ctx: ParserContext<T, T[]>, dataOffset: number, option?: ParserOptionComposable): ValueSpec<number> {
        const eos = this.eos;
        const value = isBoolean(eos) ? eosFlag(option.eos) : isNumber(eos) ? eos : eos(ctx);
        return Uint8.write(ctx, dataOffset, value);
    }

    valueSpecs(itemSpecs: ValueSpec<T>[], byteOffset: number, addSize: number): ValueSpec<T[]> {
        const items = itemSpecs.map(itemSpec => itemSpec.value);
        const itemsSize = itemSpecs.map(itemSpec => itemSpec.byteSize).reduce((a, b) => a + b);
        const byteSize = itemsSize + addSize;
        return this.valueSpec(items, byteOffset, byteSize);
    }

    read(ctx: ParserContext<T[]>, byteOffset: number, option?: ParserOptionComposable): ValueSpec<T[]> {
        const { item: itemParser, count, size, eos } = this;

        const itemSpecs: ValueSpec<T>[] = [];
        const items: T[] = [];
        let itemsByteSize = 0;

        const subContext = createContext(items, ctx);

        if (!isUndefined(count)) {
            // 使用传入的 count 选项获取字符串长度
            const countSpec = this.readOptionNumber(ctx, count, byteOffset);
            for (let readIndex = 0; readIndex < countSpec.value; readIndex++) {
                const itemSpec = itemParser.read(subContext, countSpec.offsetEnd + itemsByteSize, option);
                itemSpecs.push(itemSpec);
                items.push(itemSpec.value);
                itemsByteSize += itemSpec.byteSize;
            }
            return this.valueSpecs(itemSpecs, byteOffset, countSpec.byteSize);
        }

        if (!isUndefined(size)) {
            // 使用传入的 size 选项获取字符串长度
            const sizeSpec = this.readOptionNumber(ctx, size, byteOffset);

            while (itemsByteSize < sizeSpec.value) {
                const itemSpec = itemParser.read(subContext, sizeSpec.offsetEnd + itemsByteSize, option);
                itemSpecs.push(itemSpec);
                items.push(itemSpec.value);
                itemsByteSize += itemSpec.byteSize;
            }

            if (itemsByteSize > sizeSpec.value) {
                throw Error('Invalid array data read');
            }

            return this.valueSpecs(itemSpecs, byteOffset, sizeSpec.byteSize);
        }

        if (!isUndefined(eos)) {
            // 使用 eosJudge 来确定读取Array的长度
            while (this.eosJudge(ctx, byteOffset + itemsByteSize)) {
                const itemSpec = itemParser.read(subContext, byteOffset + itemsByteSize, option);
                itemSpecs.push(itemSpec);
                items.push(itemSpec.value);
                itemsByteSize += itemSpec.byteSize;
            }

            // 这里表示将eos标志位也算入Array数据长度
            const eosSize = 1;
            return this.valueSpecs(itemSpecs, byteOffset, eosSize);
        }

        // 如果没有提供 count,size或eos，则抛出错误，因为无法确定Array的长度
        throw new Error('Either count,size or eos must be provided to read the array.');
    }

    write(ctx: ParserContext<T[]>, byteOffset: number, value: T[], option?: ParserOptionComposable): ValueSpec<T[]> {
        const { item: itemParser, count, size, eos } = this;
        if (!isUndefined(count)) {
            // 使用传入的 count 选项写入字符串长度
            const countSpec = this.writeOptionNumber(ctx, count, byteOffset, value.length);
            const itemSpecs: ValueSpec<T>[] = [];
            let itemsByteSize = 0;
            for (const item of value) {
                const itemSpec = itemParser.write(ctx, countSpec.offsetEnd + itemsByteSize, item, option);
                itemSpecs.push(itemSpec);
                itemsByteSize += itemSpec.byteSize;
            }
            return this.valueSpecs(itemSpecs, byteOffset, countSpec.byteSize);
        }

        if (!isUndefined(size)) {
            // 使用传入的 size 选项写入字符串长度（暂时未知具体长度，先写0，以获取offset）
            const sizeSpec = this.writeOptionNumber(ctx, size, byteOffset, 0);

            const itemSpecs: ValueSpec<T>[] = [];
            let itemsByteSize = 0;
            for (const item of value) {
                const itemSpec = itemParser.write(ctx, sizeSpec.offsetEnd + itemsByteSize, item, option);
                itemSpecs.push(itemSpec);
                itemsByteSize += itemSpec.byteSize;
            }

            // 回到初始位置，写入正确的size
            this.writeOptionNumber(ctx, size, byteOffset, itemsByteSize);

            return this.valueSpecs(itemSpecs, byteOffset, sizeSpec.byteSize);
        }

        if (!isUndefined(eos)) {
            const itemSpecs: ValueSpec<T>[] = [];
            let itemsByteSize = 0;
            for (const item of value) {
                const itemSpec = itemParser.write(ctx, byteOffset + itemsByteSize, item, option);
                itemSpecs.push(itemSpec);
                itemsByteSize += itemSpec.byteSize;
            }

            this.eosMark(ctx, byteOffset + itemsByteSize);

            // 这里表示将eos标志位也算入Array数据长度
            const eosSize = 1;
            return this.valueSpecs(itemSpecs, byteOffset, eosSize);
        }
        // 如果没有提供 count,size或eos，则抛出错误，因为无法确定Array的长度
        throw new Error('Either count,size or eos must be provided to write the array.');
    }

}

export class PrimitiveArrayParser<T, TArray> extends AdvancedParser<TArray> {
    private readonly PrimitiveArrayConstructor: PrimitiveArrayConstructor<T, TArray>;
    private readonly baseArrayParser: BaseArrayParser<T>;

    constructor(constructor: PrimitiveArrayConstructor<T, TArray>, option: BaseArrayParserOption<T>) {
        super();
        this.PrimitiveArrayConstructor = constructor;
        this.baseArrayParser = new BaseArrayParser<T>(option);
    }

    read(ctx: ParserContext<TArray>, byteOffset: number, option: ParserOptionComposable | undefined): ValueSpec<TArray> {
        const { value: baseArray, byteSize } = this.baseArrayParser.read(ctx as ParserContext<T[]>, byteOffset, option);
        const tArray = this.PrimitiveArrayConstructor.from(baseArray);
        return this.valueSpec(tArray, byteOffset, byteSize);
    }

    write(ctx: ParserContext<TArray>, byteOffset: number, value: TArray, option: ParserOptionComposable | undefined): ValueSpec<TArray> {
        const { value: baseArray, byteSize } = this.baseArrayParser.write(ctx as ParserContext<T[]>, byteOffset, Array.from<T>(value), option);
        return this.valueSpec(value, byteOffset, byteSize);
    }
}

namespace OriConstructors {
    export const OriInt8Array = Int8Array;
    export const OriUint8Array = Uint8Array;
    export const OriInt16Array = Int16Array;
    export const OriUint16Array = Uint16Array;
    export const OriInt32Array = Int32Array;
    export const OriUint32Array = Uint32Array;
    export const OriFloat32Array = Float32Array;
    export const OriFloat64Array = Float64Array;
    export const OriBigInt64Array = BigInt64Array;
    export const OriBigUint64Array = BigUint64Array;
}
namespace Constructors {
    export const Int8Array = OriConstructors.OriInt8Array as PrimitiveArrayConstructor<number, Int8Array>;
    export const Uint8Array = OriConstructors.OriUint8Array as PrimitiveArrayConstructor<number, Uint8Array>;
    export const Int16Array = OriConstructors.OriInt16Array as PrimitiveArrayConstructor<number, Int16Array>;
    export const Uint16Array = OriConstructors.OriUint16Array as PrimitiveArrayConstructor<number, Uint16Array>;
    export const Int32Array = OriConstructors.OriInt32Array as PrimitiveArrayConstructor<number, Int32Array>;
    export const Uint32Array = OriConstructors.OriUint32Array as PrimitiveArrayConstructor<number, Uint32Array>;
    export const Float32Array = OriConstructors.OriFloat32Array as PrimitiveArrayConstructor<number, Float32Array>;
    export const Float64Array = OriConstructors.OriFloat64Array as PrimitiveArrayConstructor<number, Float64Array>;
    export const BigInt64Array = OriConstructors.OriBigInt64Array as PrimitiveArrayConstructor<bigint, BigInt64Array>;
    export const BigUint64Array = OriConstructors.OriBigUint64Array as PrimitiveArrayConstructor<bigint, BigUint64Array>;
}

getArrayParser.BigInt64Array({
    eos: (ctx) => ctx.parent.length,
});

export function getArrayParser<T>(option: BaseArrayParserOption<T>) {
    return new BaseArrayParser(option);
}

export namespace getArrayParser {
    function createGetter<T, TArray>(
        item: PrimitiveParser<T>,
        constructor: PrimitiveArrayConstructor<T, TArray>,
    ) {
        return function (option: BaseArrayParserOptionComputed<T>) {
            return new PrimitiveArrayParser<T, TArray>(constructor, { item, ...option });
        };
    }

    export const Int8Array = createGetter(Int8, Constructors.Int8Array);
    export const Uint8Array = createGetter(Uint8, Constructors.Uint8Array);
    export const Int16Array = createGetter(Int16, Constructors.Int16Array);
    export const Uint16Array = createGetter(Uint16, Constructors.Uint16Array);
    export const Int32Array = createGetter(Int32, Constructors.Int32Array);
    export const Uint32Array = createGetter(Uint32, Constructors.Uint32Array);
    export const Float32Array = createGetter(Float32, Constructors.Float32Array);
    export const Float64Array = createGetter(Float64, Constructors.Float64Array);
    export const BigInt64Array = createGetter(BigInt64, Constructors.BigInt64Array);
    export const BigUint64Array = createGetter(BigUint64, Constructors.BigUint64Array);
    export const Int16BEArray = createGetter(Int16BE, Constructors.Int16Array);
    export const Uint16BEArray = createGetter(Uint16BE, Constructors.Uint16Array);
    export const Int32BEArray = createGetter(Int32BE, Constructors.Int32Array);
    export const Uint32BEArray = createGetter(Uint32BE, Constructors.Uint32Array);
    export const Float32BEArray = createGetter(Float32BE, Constructors.Float32Array);
    export const Float64BEArray = createGetter(Float64BE, Constructors.Float64Array);
    export const BigInt64BEArray = createGetter(BigInt64BE, Constructors.BigInt64Array);
    export const BigUint64BEArray = createGetter(BigUint64BE, Constructors.BigUint64Array);
    export const Int16LEArray = createGetter(Int16LE, Constructors.Int16Array);
    export const Uint16LEArray = createGetter(Uint16LE, Constructors.Uint16Array);
    export const Int32LEArray = createGetter(Int32LE, Constructors.Int32Array);
    export const Uint32LEArray = createGetter(Uint32LE, Constructors.Uint32Array);
    export const Float32LEArray = createGetter(Float32LE, Constructors.Float32Array);
    export const Float64LEArray = createGetter(Float64LE, Constructors.Float64Array);
    export const BigInt64LEArray = createGetter(BigInt64LE, Constructors.BigInt64Array);
    export const BigUint64LEArray = createGetter(BigUint64LE, Constructors.BigUint64Array);
}
