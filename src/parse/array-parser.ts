import { assertType, isBoolean, isNumber, isObject, isUndefined } from '../utils/type-util.ts';
import { AdvancedParser, BaseParser, ContextCompute, ParserContext, ParserOptionComposable, ValueSpec } from './base-parser.ts';
import { PrimitiveParser, Uint8 } from './primitive-parser.ts';

export type ArrayParserOptionNumber<T> = ContextCompute<number> | PrimitiveParser<number> | number;
export type ArrayParserOptionEos<T> = ContextCompute<number> | number | boolean;// 支持：1.指定结束于固定数字或者 2.根据下一个unit8判断

export type ArrayParserOptionRequired<T> = { item: BaseParser<T> };
export type ArrayParserCountReader<T> = { count: ArrayParserOptionNumber<T> };
export type ArrayParserSizeReader<T> = { size: ArrayParserOptionNumber<T> };
export type ArrayParserEosReader<T> = { ends: ArrayParserOptionEos<T> };

export type ArrayParserReaderPartial<T> =
    & Partial<ArrayParserCountReader<T>>
    & Partial<ArrayParserSizeReader<T>>
    & Partial<ArrayParserEosReader<T>>;

export type ArrayParserReaderComputed<T> =
    | ArrayParserCountReader<T>
    | ArrayParserSizeReader<T>
    | ArrayParserEosReader<T>;

export type BaseArrayParserOption<T> = ArrayParserOptionRequired<T> & ArrayParserReaderComputed<T>;

const DEFAULT_ENDS_FLAG = 0x00;
const endsFlag = (end?: number) => !isUndefined(end) ? end : DEFAULT_ENDS_FLAG;

export class ArrayParser<T> extends AdvancedParser<T[]> {
    private readonly itemParser: BaseParser<T>;
    private readonly count?: ArrayParserOptionNumber<T[]>;
    private readonly size?: ArrayParserOptionNumber<T[]>;
    private readonly ends?: ArrayParserOptionEos<T[]>;

    constructor(option: BaseArrayParserOption<T>) {
        super();
        const { item: itemParser, ...optionPartial } = option;
        const { count, size, ends } = optionPartial as ArrayParserReaderPartial<T[]>;
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

    readOptionNumber(ctx: ParserContext, option: ArrayParserOptionNumber<T[]>, byteOffset: number): ValueSpec<number> {
        if (isObject(option) && option instanceof PrimitiveParser && assertType<PrimitiveParser<number>>(option)) {
            return option.read(ctx, byteOffset);
        }
        if (typeof option === 'function' || typeof option === 'number') {
            const value = typeof option === 'number' ? option : option(ctx, ctx.scope);
            return BaseParser.valueSpec(value, byteOffset, 0);
        }
        throw Error('one of NumberOption is not valid');
    }

    writeOptionNumber(ctx: ParserContext, option: ArrayParserOptionNumber<T[]>, byteOffset: number, value: number): ValueSpec<number> {
        if (isObject(option) && option instanceof PrimitiveParser && assertType<PrimitiveParser<number>>(option)) {
            return option.write(ctx, byteOffset, value);
        }
        if (typeof option === 'function' || typeof option === 'number') {
            // const value = typeof size === 'number' ? size : size({});
            return BaseParser.valueSpec(value, byteOffset, 0);
        }
        throw Error('one of NumberOption is not valid');
    }

    endsJudge(ctx: ParserContext, dataOffset: number, option?: ParserOptionComposable): boolean {
        const ends = this.ends;
        const [ nextUInt8 ] = Uint8.read(ctx, dataOffset);
        if (isBoolean(ends)) return nextUInt8 === endsFlag(option?.end);
        if (isNumber(ends)) return nextUInt8 === ends;
        return nextUInt8 === ends!(ctx, ctx.scope);
    }

    endsMark(ctx: ParserContext, dataOffset: number, option?: ParserOptionComposable): ValueSpec<number> {
        const ends = this.ends;
        const value = isBoolean(ends) ? endsFlag(option?.end) : isNumber(ends) ? ends : ends!(ctx, ctx.scope);
        return Uint8.write(ctx, dataOffset, value);
    }

    valueSpecs(itemSpecs: ValueSpec<T>[], byteOffset: number, addSize: number): ValueSpec<T[]> {
        const items = itemSpecs.map(([ value ]) => value);
        const itemsSize = itemSpecs
            .map(spec => spec.size)
            .reduce((a, b) => a + b, 0);
        const byteSize = itemsSize + addSize;
        return this.valueSpec(items, byteOffset, byteSize);
    }

    read(ctx: ParserContext, byteOffset: number, option?: ParserOptionComposable): ValueSpec<T[]> {
        const { itemParser, count, size, ends } = this;

        const itemSpecs: ValueSpec<T>[] = [];
        let itemsByteSize = 0;
        const subContext = ctx.derive();

        if (!isUndefined(count)) {
            // 使用传入的 count 选项获取字符串长度
            const [ countValue, countSpec ] = this.readOptionNumber(subContext, count, byteOffset);
            for (let readIndex = 0; readIndex < countValue; readIndex++) {
                const itemSpec = itemParser.read(subContext, countSpec.end + itemsByteSize, option);
                itemSpecs.push(itemSpec);
                itemsByteSize += itemSpec.size;
            }
            return this.valueSpecs(itemSpecs, byteOffset, countSpec.size);
        }

        if (!isUndefined(size)) {
            // 使用传入的 size 选项获取字符串长度
            const [ sizeValue, sizeSpec ] = this.readOptionNumber(subContext, size, byteOffset);

            while (itemsByteSize < sizeValue) {
                const itemSpec = itemParser.read(subContext, sizeSpec.end + itemsByteSize, option);
                itemSpecs.push(itemSpec);
                itemsByteSize += itemSpec.size;
            }

            if (itemsByteSize > sizeValue) {
                throw Error('Invalid array data read');
            }

            return this.valueSpecs(itemSpecs, byteOffset, sizeSpec.size);
        }

        if (!isUndefined(ends)) {
            // 使用 endsJudge 来确定读取Array的长度
            while (!this.endsJudge(subContext, byteOffset + itemsByteSize)) {
                const itemSpec = itemParser.read(subContext, byteOffset + itemsByteSize, option);
                itemSpecs.push(itemSpec);
                itemsByteSize += itemSpec.size;
            }

            // 这里表示将end标志位也算入Array数据长度
            const endsSize = 1;
            return this.valueSpecs(itemSpecs, byteOffset, endsSize);
        }

        // 如果没有提供 count,size或end，则抛出错误，因为无法确定Array的长度
        throw new Error('Either count,size or end must be provided to read the array.');
    }

    write(ctx: ParserContext, byteOffset: number, value: T[], option?: ParserOptionComposable): ValueSpec<T[]> {
        const subContext = ctx.derive();
        const { itemParser, count, size, ends } = this;
        if (!isUndefined(count)) {
            // 使用传入的 count 选项写入字符串长度
            const countSpec = this.writeOptionNumber(subContext, count, byteOffset, value.length);
            const itemSpecs: ValueSpec<T>[] = [];
            let itemsByteSize = 0;
            for (const item of value) {
                const itemSpec = itemParser.write(ctx, countSpec.end + itemsByteSize, item, option);
                itemSpecs.push(itemSpec);
                itemsByteSize += itemSpec.size;
            }
            return this.valueSpecs(itemSpecs, byteOffset, countSpec.size);
        }

        if (!isUndefined(size)) {
            // 使用传入的 size 选项写入字符串长度（暂时未知具体长度，先写0，以获取offset）
            const sizeSpec = this.writeOptionNumber(subContext, size, byteOffset, 0);

            const itemSpecs: ValueSpec<T>[] = [];
            let itemsByteSize = 0;
            for (const item of value) {
                const itemSpec = itemParser.write(ctx, sizeSpec.end + itemsByteSize, item, option);
                itemSpecs.push(itemSpec);
                itemsByteSize += itemSpec.size;
            }

            // 回到初始位置，写入正确的size
            this.writeOptionNumber(subContext, size, byteOffset, itemsByteSize);

            return this.valueSpecs(itemSpecs, byteOffset, sizeSpec.size);
        }

        if (!isUndefined(ends)) {
            const itemSpecs: ValueSpec<T>[] = [];
            let itemsByteSize = 0;
            for (const item of value) {
                const itemSpec = itemParser.write(ctx, byteOffset + itemsByteSize, item, option);
                itemSpecs.push(itemSpec);
                itemsByteSize += itemSpec.size;
            }

            this.endsMark(subContext, byteOffset + itemsByteSize);

            // 这里表示将end标志位也算入Array数据长度
            const endSize = 1;
            return this.valueSpecs(itemSpecs, byteOffset, endSize);
        }
        // 如果没有提供 count,size或end，则抛出错误，因为无法确定Array的长度
        throw new Error('Either count,size or end must be provided to write the array.');
    }

    default(value: T[] | undefined, byteOffset: number, byteSize = 0): ValueSpec<T[]> {
        return super.default(value || [], byteOffset, byteSize);
    }
}

export function createArrayParser<T>(option: BaseArrayParserOption<T>) {
    return new ArrayParser<T>(option);
}

export {
    createArrayParser as Array,
};
