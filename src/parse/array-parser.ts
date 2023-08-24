import { AdvancedParser, BaseParser, BaseParserConfig, createParserCreator } from '../context/base-parser.ts';
import { SnapTuple } from '../context/parser-context.ts';
import { ContextCompute, ContextOption, ParserContext } from '../context/types.ts';
import { getTypedParser } from '../decorate/decorator.ts';
import { Constructor, SafeAny } from '../utils/prototype-util.ts';
import { assertType, isBoolean, isFunction, isNumber, isObject, isUndefined } from '../utils/type-util.ts';
import { PrimitiveParser, Uint8 } from './primitive-parser.ts';

export type ArrayParserOptionNumber = ContextCompute<number> | PrimitiveParser<number> | number;
export type ArrayParserOptionEos = ContextCompute<number> | number | boolean;// 支持：1.指定结束于固定数字或者 2.根据下一个unit8判断

export type ArrayParserConfigRequired<T> = { item: BaseParser<T> | (new() => T) | ContextCompute<BaseParser<SafeAny> | (new() => SafeAny)> };
export type ArrayParserCountReader = { count: ArrayParserOptionNumber };
export type ArrayParserSizeReader = { size: ArrayParserOptionNumber };
export type ArrayParserEosReader = { ends: ArrayParserOptionEos };

export type ArrayParserIndexExpose = { index?: ContextCompute<string> | string }

export type ArrayParserReaderPartial =
    & Partial<ArrayParserCountReader>
    & Partial<ArrayParserSizeReader>
    & Partial<ArrayParserEosReader>;

export type ArrayParserConfigComputed =
    | ArrayParserCountReader
    | ArrayParserSizeReader
    | ArrayParserEosReader;

export type ArrayParserConfig<T> =
    & BaseParserConfig
    & ArrayParserIndexExpose
    & ArrayParserConfigRequired<T>
    & ArrayParserConfigComputed;

const DEFAULT_ENDS_FLAG = 0x00;
const endsFlag = (end?: number) => !isUndefined(end) ? end : DEFAULT_ENDS_FLAG;

export class ArrayParser<T> extends AdvancedParser<T[]> {
    private readonly item: BaseParser<T> | (new() => T) | ContextCompute<BaseParser<T> | (new() => T)>;
    private readonly count?: ArrayParserOptionNumber;
    private readonly size?: ArrayParserOptionNumber;
    private readonly ends?: ArrayParserOptionEos;
    private readonly indexName: ContextCompute<string> | string;

    constructor(option: ArrayParserConfig<T>) {
        super(option);
        const { item, index, ...optionPartial } = option;
        const { count, size, ends } = optionPartial as ArrayParserReaderPartial;
        if (isUndefined(item)) {
            throw new Error('Invalid parser options. Option [item] is required.');
        }
        if (Number(!isUndefined(count)) + Number(!isUndefined(size)) + Number(!isUndefined(ends)) !== 1) {
            throw new Error('Invalid parser options. Only one of [size] or [end].');
        }
        this.item = item;
        this.indexName = index || '$index';
        this.count = count;
        this.size = size;
        this.ends = ends;
    }

    resolveItemParser(ctx: ParserContext, item: BaseParser<T> | (new() => T) | ContextCompute<BaseParser<T> | (new() => T)>): BaseParser<T> {
        if (item instanceof BaseParser) return item;
        const parserCached = getTypedParser(item as Constructor<SafeAny>);
        if (parserCached) return parserCached;
        if (!assertType<ContextCompute<BaseParser<T> | (new() => T)>>(item)) throw Error('never');
        if (!isFunction(item)) throw Error('unknown array item parser type');
        const resolvedParser = ctx.compute(item);
        if (resolvedParser instanceof BaseParser) return resolvedParser;
        return getTypedParser(resolvedParser as Constructor<SafeAny>);
    }

    readConfigNumber(ctx: ParserContext, config: ArrayParserOptionNumber, option?: Partial<ContextOption>): SnapTuple<number> {
        if (isObject(config) && config instanceof PrimitiveParser) {
            return ctx.read(config, option);
        }
        if (typeof config === 'function' || typeof config === 'number') {
            const value = typeof config === 'number' ? config : ctx.compute(config);
            return ctx.result(value, 0);
        }
        throw Error('one of NumberOption is not valid');
    }

    writeConfigNumber(ctx: ParserContext, config: ArrayParserOptionNumber, value: number, option?: Partial<ContextOption>): SnapTuple<number> {
        if (isObject(config) && config instanceof PrimitiveParser) {
            return ctx.write(config, value, option);
        }
        if (typeof config === 'function' || typeof config === 'number') {
            return ctx.result(value, 0);
        }
        throw Error('one of NumberOption is not valid');
    }

    endsCompute(ctx: ParserContext) {
        const ends = this.ends!;
        if (isBoolean(ends)) return endsFlag(ctx.option.ends);
        if (isNumber(ends)) return ends;
        return ctx.compute(ends);
    }

    read(ctx: ParserContext): T[] {
        const { item, indexName, count, size, ends } = this;
        const itemParser = this.resolveItemParser(ctx, item);

        const $index = isFunction(indexName) ? ctx.compute(indexName) : indexName;
        const items: T[] = [];

        const parentPath = ctx.scope.$path || '';

        if (!isUndefined(count)) {
            // 使用传入的 count 选项获取数组长度
            const [ countValue ] = this.readConfigNumber(ctx, count);
            for (let readIndex = 0; readIndex < countValue; readIndex++) {
                ctx.expose($index, items.length);
                ctx.expose('$path', `${parentPath}[${items.length}]`);
                const [ itemValue ] = ctx.read(itemParser);
                items.push(itemValue);
            }
        }

        if (!isUndefined(size)) {
            // 使用传入的 size 选项获取数组长度
            const [ sizeValue, sizeSnap ] = this.readConfigNumber(ctx, size);

            while (true) {
                ctx.expose($index, items.length);
                ctx.expose('$path', `${parentPath}[${items.length}]`);
                const collectSize = ctx.size - sizeSnap.size;
                if (collectSize > sizeValue) throw Error('Invalid array data read');
                if (collectSize === sizeValue) break;
                const [ itemValue ] = ctx.read(itemParser);
                items.push(itemValue);
            }
        }

        if (!isUndefined(ends)) {
            // 使用 endsJudge 来确定读取Array的长度
            const endsJudge = this.endsCompute(ctx);

            while (true) {
                ctx.expose($index, items.length);
                ctx.expose('$path', `${parentPath}[${items.length}]`);
                const [ next ] = ctx.read(Uint8, { consume: false });
                if (next === endsJudge) break;
                const [ itemValue ] = ctx.read(itemParser);
                items.push(itemValue);
            }
            ctx.read(Uint8);
        }

        return items;
    }

    write(ctx: ParserContext, value: T[]): T[] {
        const { item, indexName, count, size, ends } = this;
        const itemParser = this.resolveItemParser(ctx, item);
        const $index = isFunction(indexName) ? ctx.compute(indexName) : indexName;

        if (!isUndefined(count)) {
            // 使用传入的 count 选项写入数组长度
            this.writeConfigNumber(ctx, count, value.length);
            for (const [ idx, item ] of value.entries()) {
                ctx.expose($index, idx);
                ctx.write(itemParser, item);
            }
        }

        if (!isUndefined(size)) {
            // 使用传入的 size 选项写入数组长度（暂时未知具体长度，先写0，以获取offset）
            this.writeConfigNumber(ctx, size, 0);
            const beforeSize = ctx.size;

            for (const [ idx, item ] of value.entries()) {
                ctx.expose($index, idx);
                ctx.write(itemParser, item);
            }

            // 回到初始位置，写入正确的size
            const afterSize = ctx.size;
            this.writeConfigNumber(ctx, size, afterSize - beforeSize, { point: ctx.start, consume: false });
        }

        if (!isUndefined(ends)) {
            const endsMark = this.endsCompute(ctx);

            for (const [ idx, item ] of value.entries()) {
                ctx.expose($index, idx);
                ctx.write(itemParser, item);
            }

            ctx.write(Uint8, endsMark);
        }

        return value;
    }
}

const ArrayParserCreator = createParserCreator(ArrayParser);

export {
    ArrayParserCreator,
    ArrayParserCreator as Array,
    ArrayParserCreator as array,
};
