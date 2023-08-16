// deno-lint-ignore-file no-namespace
import { AdvancedParser, BaseParser, createContext, ParserContext, ParserOptionComposable, ValueSpec } from './base-parser.ts';
import * as TypedArray from '../describe/interface.ts';
import {
    BigInt64, BigInt64BE, BigInt64LE, BigUint64, BigUint64BE, BigUint64LE,
    Float32, Float32BE, Float32LE, Float64, Float64BE, Float64LE,
    Int16, Int16BE, Int16LE, Int32, Int32BE, Int32LE, Int8,
    PrimitiveParser,
    Uint16, Uint16BE, Uint16LE, Uint32, Uint32BE, Uint32LE, Uint8,
} from './primitive-parser.ts';
import { assertType, isBoolean, isNumber, isObject, isUndefined } from '../utils/type-util.ts';
import { TypedArrayFactory } from '../describe/interface.ts';

export type ArrayParserOptionNumber<T> = ((ctx: ParserContext<T>) => number) | PrimitiveParser<number> | number;
export type ArrayParserOptionEos<T> = ((ctx: ParserContext<T>) => number) | number | boolean;// 支持：1.指定结束于固定数字或者 2.根据下一个unit8判断

export type ArrayParserOptionRequired<T> = { item: BaseParser<T> };
export type ArrayParserCountReader<T> = { count: ArrayParserOptionNumber<T> };
export type ArrayParserSizeReader<T> = { size: ArrayParserOptionNumber<T> };
export type ArrayParserEosReader<T> = { ends: ArrayParserOptionEos<T> };

export type ArrayParserReaderPartial<T> = Partial<ArrayParserCountReader<T>> & Partial<ArrayParserSizeReader<T>> & Partial<ArrayParserEosReader<T>>;
export type ArrayParserReaderComputed<T> = ArrayParserCountReader<T> | ArrayParserSizeReader<T> | ArrayParserEosReader<T>;

export type BaseArrayParserOption<T> = ArrayParserOptionRequired<T> & ArrayParserReaderComputed<T>;

const DEFAULT_END_FLAG = 0x00;
const endFlag = (end?: number) => !isUndefined(end) ? end : DEFAULT_END_FLAG;

export class ArrayParser<T> extends AdvancedParser<T[]> {
    private readonly itemParser: BaseParser<T>;
    private readonly count?: ArrayParserOptionNumber<T[]>;
    private readonly size?: ArrayParserOptionNumber<T[]>;
    private readonly ends?: ArrayParserOptionEos<T[]>;

    constructor(option: BaseArrayParserOption<T>) {
        super();
        const { item: itemParser, ...readerPartial } = option;
        const { count, size, ends } = readerPartial as ArrayParserReaderPartial<T[]>;
        if (isUndefined(itemParser)) {
            throw new Error('Invalid parser options. Option [item] is required.');
        }
        if (Number(!isUndefined(count)) + Number(!isUndefined(size)) + Number(!isUndefined(ends)) !== 1) {
            throw new Error('Invalid parser options. Only one of [size] or [end].');
        }
        this.itemParser = itemParser;
        this.count = count;
        this.size = size;
        this.ends = ends;
    }

    readOptionNumber(ctx: ParserContext<T[]>, option: ArrayParserOptionNumber<T[]>, byteOffset: number): ValueSpec<number> {
        if (isObject(option) && option instanceof PrimitiveParser && assertType<PrimitiveParser<number>>(option)) {
            return option.read(ctx, byteOffset);
        }
        if (typeof option === 'function' || typeof option === 'number') {
            const value = typeof option === 'number' ? option : option(ctx);
            return BaseParser.valueSpec(value, byteOffset, 0);
        }
        throw Error('one of NumberOption is not valid');
    }

    writeOptionNumber(ctx: ParserContext<T[]>, option: ArrayParserOptionNumber<T[]>, byteOffset: number, value: number): ValueSpec<number> {
        if (isObject(option) && option instanceof PrimitiveParser && assertType<PrimitiveParser<number>>(option)) {
            return option.write(ctx, byteOffset, value);
        }
        if (typeof option === 'function' || typeof option === 'number') {
            // const value = typeof size === 'number' ? size : size({});
            return BaseParser.valueSpec(value, byteOffset, 0);
        }
        throw Error('one of NumberOption is not valid');
    }

    endsJudge(ctx: ParserContext<T[]>, dataOffset: number, option?: ParserOptionComposable): boolean {
        const ends = this.ends;
        const { value: nextUInt8 } = Uint8.read(ctx, dataOffset);
        if (isBoolean(ends)) return nextUInt8 === endFlag(option?.end);
        if (isNumber(ends)) return nextUInt8 === ends;
        return nextUInt8 === ends!(ctx);
    }

    endsMark(ctx: ParserContext<T[]>, dataOffset: number, option?: ParserOptionComposable): ValueSpec<number> {
        const ends = this.ends;
        const value = isBoolean(ends) ? endFlag(option?.end) : isNumber(ends) ? ends : ends!(ctx);
        return Uint8.write(ctx, dataOffset, value);
    }

    valueSpecs(itemSpecs: ValueSpec<T>[], byteOffset: number, addSize: number): ValueSpec<T[]> {
        const items = itemSpecs.map(itemSpec => itemSpec.value);
        const itemsSize = itemSpecs
            .map(itemSpec => itemSpec.byteSize)
            .reduce((a, b) => a + b, 0);
        const byteSize = itemsSize + addSize;
        return this.valueSpec(items, byteOffset, byteSize);
    }

    read(ctx: ParserContext<unknown>, byteOffset: number, option?: ParserOptionComposable): ValueSpec<T[]> {
        const { itemParser, count, size, ends } = this;

        const itemSpecs: ValueSpec<T>[] = [];
        const items: T[] = [];
        let itemsByteSize = 0;
        const subContext = createContext(ctx, items);

        if (!isUndefined(count)) {
            // 使用传入的 count 选项获取字符串长度
            const countSpec = this.readOptionNumber(subContext, count, byteOffset);
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
            const sizeSpec = this.readOptionNumber(subContext, size, byteOffset);

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

        if (!isUndefined(ends)) {
            // 使用 endJudge 来确定读取Array的长度
            while (!this.endsJudge(subContext, byteOffset + itemsByteSize)) {
                const itemSpec = itemParser.read(subContext, byteOffset + itemsByteSize, option);
                itemSpecs.push(itemSpec);
                items.push(itemSpec.value);
                itemsByteSize += itemSpec.byteSize;
            }

            // 这里表示将end标志位也算入Array数据长度
            const endsSize = 1;
            return this.valueSpecs(itemSpecs, byteOffset, endsSize);
        }

        // 如果没有提供 count,size或end，则抛出错误，因为无法确定Array的长度
        throw new Error('Either count,size or end must be provided to read the array.');
    }

    write(ctx: ParserContext<unknown>, byteOffset: number, value: T[], option?: ParserOptionComposable): ValueSpec<T[]> {
        const subContext = createContext(ctx, value);
        const { itemParser, count, size, ends } = this;
        if (!isUndefined(count)) {
            // 使用传入的 count 选项写入字符串长度
            const countSpec = this.writeOptionNumber(subContext, count, byteOffset, value.length);
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
            const sizeSpec = this.writeOptionNumber(subContext, size, byteOffset, 0);

            const itemSpecs: ValueSpec<T>[] = [];
            let itemsByteSize = 0;
            for (const item of value) {
                const itemSpec = itemParser.write(ctx, sizeSpec.offsetEnd + itemsByteSize, item, option);
                itemSpecs.push(itemSpec);
                itemsByteSize += itemSpec.byteSize;
            }

            // 回到初始位置，写入正确的size
            this.writeOptionNumber(subContext, size, byteOffset, itemsByteSize);

            return this.valueSpecs(itemSpecs, byteOffset, sizeSpec.byteSize);
        }

        if (!isUndefined(ends)) {
            const itemSpecs: ValueSpec<T>[] = [];
            let itemsByteSize = 0;
            for (const item of value) {
                const itemSpec = itemParser.write(ctx, byteOffset + itemsByteSize, item, option);
                itemSpecs.push(itemSpec);
                itemsByteSize += itemSpec.byteSize;
            }

            this.endsMark(subContext, byteOffset + itemsByteSize);

            // 这里表示将end标志位也算入Array数据长度
            const endSize = 1;
            return this.valueSpecs(itemSpecs, byteOffset, endSize);
        }
        // 如果没有提供 count,size或end，则抛出错误，因为无法确定Array的长度
        throw new Error('Either count,size or end must be provided to write the array.');
    }

}

export class TypedArrayParser<T, TypedArray extends ArrayLike<T>> extends AdvancedParser<TypedArray> {
    private readonly typedFactory: TypedArrayFactory<T, TypedArray>;
    private readonly baseArrayParser: ArrayParser<T>;

    constructor(constructor: TypedArrayFactory<T, TypedArray>, option: BaseArrayParserOption<T>) {
        super();
        this.typedFactory = constructor;
        this.baseArrayParser = new ArrayParser<T>(option);
    }

    read(ctx: ParserContext<unknown>, byteOffset: number, option: ParserOptionComposable | undefined): ValueSpec<TypedArray> {
        const { value: baseArray, byteSize } = this.baseArrayParser.read(ctx, byteOffset, option);
        const tArray = this.typedFactory.from(baseArray);
        return this.valueSpec(tArray, byteOffset, byteSize);
    }

    write(ctx: ParserContext<unknown>, byteOffset: number, value: TypedArray, option: ParserOptionComposable | undefined): ValueSpec<TypedArray> {
        const { value: baseArray, byteSize } = this.baseArrayParser.write(ctx, byteOffset, Array.from<T>(value), option);
        return this.valueSpec(value, byteOffset, byteSize);
    }
}

export function getArrayParser<T>(option: BaseArrayParserOption<T>) {
    return new ArrayParser<T>(option);
}

export namespace getArrayParser {
    function createGetter<T, TArray extends ArrayLike<T>>(item: PrimitiveParser<T>, constructor: TypedArrayFactory<T, TArray>) {
        return function (option: ArrayParserReaderComputed<T>) {
            return new TypedArrayParser<T, TArray>(constructor, { item, ...option });
        };
    }

    export const Int8Array = createGetter(Int8, TypedArray.Int8Array);
    export const Uint8Array = createGetter(Uint8, TypedArray.Uint8Array);
    export const Int16Array = createGetter(Int16, TypedArray.Int16Array);
    export const Uint16Array = createGetter(Uint16, TypedArray.Uint16Array);
    export const Int32Array = createGetter(Int32, TypedArray.Int32Array);
    export const Uint32Array = createGetter(Uint32, TypedArray.Uint32Array);
    export const Float32Array = createGetter(Float32, TypedArray.Float32Array);
    export const Float64Array = createGetter(Float64, TypedArray.Float64Array);
    export const BigInt64Array = createGetter(BigInt64, TypedArray.BigInt64Array);
    export const BigUint64Array = createGetter(BigUint64, TypedArray.BigUint64Array);
    export const Int16BEArray = createGetter(Int16BE, TypedArray.Int16Array);
    export const Uint16BEArray = createGetter(Uint16BE, TypedArray.Uint16Array);
    export const Int32BEArray = createGetter(Int32BE, TypedArray.Int32Array);
    export const Uint32BEArray = createGetter(Uint32BE, TypedArray.Uint32Array);
    export const Float32BEArray = createGetter(Float32BE, TypedArray.Float32Array);
    export const Float64BEArray = createGetter(Float64BE, TypedArray.Float64Array);
    export const BigInt64BEArray = createGetter(BigInt64BE, TypedArray.BigInt64Array);
    export const BigUint64BEArray = createGetter(BigUint64BE, TypedArray.BigUint64Array);
    export const Int16LEArray = createGetter(Int16LE, TypedArray.Int16Array);
    export const Uint16LEArray = createGetter(Uint16LE, TypedArray.Uint16Array);
    export const Int32LEArray = createGetter(Int32LE, TypedArray.Int32Array);
    export const Uint32LEArray = createGetter(Uint32LE, TypedArray.Uint32Array);
    export const Float32LEArray = createGetter(Float32LE, TypedArray.Float32Array);
    export const Float64LEArray = createGetter(Float64LE, TypedArray.Float64Array);
    export const BigInt64LEArray = createGetter(BigInt64LE, TypedArray.BigInt64Array);
    export const BigUint64LEArray = createGetter(BigUint64LE, TypedArray.BigUint64Array);
}
