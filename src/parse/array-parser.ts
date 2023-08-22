import { AdvancedParser, BaseParser, BaseParserConfig, createParserCreator } from '../context/base-parser.ts';
import { ValueSnap } from '../context/parser-context.ts';
import { ContextCompute, ContextOption, ParserContext } from '../context/types.ts';
import { isBoolean, isFunction, isNumber, isObject, isString, isUndefined } from '../utils/type-util.ts';
import { PrimitiveParser, Uint8 } from './primitive-parser.ts';
import { getTypedParser } from '../decorate/decorator.ts';
import { Constructor } from '../utils/prototype-util.ts';

export type ArrayParserOptionNumber = ContextCompute<number> | PrimitiveParser<number> | number;
export type ArrayParserOptionEos = ContextCompute<number> | number | boolean;// 支持：1.指定结束于固定数字或者 2.根据下一个unit8判断

export type ArrayParserConfigRequired<T> = { item: BaseParser<T> | { new(): object & T } };
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
    private readonly itemParser: BaseParser<T>;
    private readonly count?: ArrayParserOptionNumber;
    private readonly size?: ArrayParserOptionNumber;
    private readonly ends?: ArrayParserOptionEos;
    private readonly indexName: ContextCompute<string> | string;

    constructor(option: ArrayParserConfig<T>) {
        super(option);
        const { item: itemParser, index, ...optionPartial } = option;
        const { count, size, ends } = optionPartial as ArrayParserReaderPartial;
        if (isUndefined(itemParser)) {
            throw new Error('Invalid parser options. Option [item] is required.');
        }
        if (Number(!isUndefined(count)) + Number(!isUndefined(size)) + Number(!isUndefined(ends)) !== 1) {
            throw new Error('Invalid parser options. Only one of [size] or [end].');
        }
        if (itemParser instanceof BaseParser) {
            this.itemParser = itemParser;
        } else {
            this.itemParser = getTypedParser(itemParser as Constructor<object & T>);
        }
        this.indexName = index || '$index';
        this.count = count;
        this.size = size;
        this.ends = ends;
    }

    readConfigNumber(ctx: ParserContext, config: ArrayParserOptionNumber, option?: Partial<ContextOption>): ValueSnap<number> {
        if (isObject(config) && config instanceof PrimitiveParser) {
            return ctx.read(config, option);
        }
        if (typeof config === 'function' || typeof config === 'number') {
            const value = typeof config === 'number' ? config : ctx.compute(config);
            return ctx.result(value, 0);
        }
        throw Error('one of NumberOption is not valid');
    }

    writeConfigNumber(ctx: ParserContext, config: ArrayParserOptionNumber, value: number, option?: Partial<ContextOption>): ValueSnap<number> {
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
        const { itemParser, indexName, count, size, ends } = this;

        const $index = isFunction(indexName) ? ctx.compute(indexName) : indexName;
        const items: T[] = [];

        if (!isUndefined(count)) {
            ctx.expose(true, $index, items.length);
            // 使用传入的 count 选项获取数组长度
            const [ countValue ] = this.readConfigNumber(ctx, count);
            for (let readIndex = 0; readIndex < countValue; readIndex++) {
                const [ item ] = ctx.read(itemParser);
                items.push(item);
            }
        }

        if (!isUndefined(size)) {
            // 使用传入的 size 选项获取数组长度
            const [ sizeValue, sizeSnap ] = this.readConfigNumber(ctx, size);

            while (true) {
                ctx.expose(true, $index, items.length);
                const collectSize = ctx.size - sizeSnap.size;
                if (collectSize > sizeValue) throw Error('Invalid array data read');
                if (collectSize === sizeValue) break;
                const [ item ] = ctx.read(itemParser);
                items.push(item);
            }
        }

        if (!isUndefined(ends)) {
            // 使用 endsJudge 来确定读取Array的长度
            const endsJudge = this.endsCompute(ctx);

            while (true) {
                ctx.expose(true, $index, items.length);
                const [ next ] = ctx.read(Uint8, { consume: false });
                if (next === endsJudge) break;
                const [ item ] = ctx.read(itemParser);
                items.push(item);
            }
            ctx.read(Uint8);
        }

        return items;
    }

    write(ctx: ParserContext, value: T[]): T[] {
        const { itemParser, indexName, count, size, ends } = this;
        const $index = isFunction(indexName) ? ctx.compute(indexName) : indexName;

        if (!isUndefined(count)) {
            // 使用传入的 count 选项写入数组长度
            this.writeConfigNumber(ctx, count, value.length);
            for (const [ idx, item ] of value.entries()) {
                ctx.expose(true, $index, idx);
                ctx.write(itemParser, item);
            }
        }

        if (!isUndefined(size)) {
            // 使用传入的 size 选项写入数组长度（暂时未知具体长度，先写0，以获取offset）
            this.writeConfigNumber(ctx, size, 0);
            const beforeSize = ctx.size;

            for (const [ idx, item ] of value.entries()) {
                ctx.expose(true, $index, idx);
                ctx.write(itemParser, item);
            }

            // 回到初始位置，写入正确的size
            const [ dataStart ] = ctx.take;
            const afterSize = ctx.size;
            this.writeConfigNumber(ctx, size, afterSize - beforeSize, { point: dataStart, consume: false });
        }

        if (!isUndefined(ends)) {
            const endsMark = this.endsCompute(ctx);

            for (const [ idx, item ] of value.entries()) {
                ctx.expose(true, $index, idx);
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
