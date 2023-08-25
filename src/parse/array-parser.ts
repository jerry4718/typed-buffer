import { AdvancedParser, BaseParser, AdvancedParserConfig, createParserCreator } from '../context/base-parser.ts';
import { SnapTuple } from '../context/parser-context.ts';
import { ContextCompute, ContextOption, ParserContext, ScopeAccessor } from '../context/types.ts';
import { getTypedParser } from '../decorate/decorator.ts';
import { Constructor, SafeAny } from '../utils/prototype-util.ts';
import { assertType, isBoolean, isFunction, isNumber, isUndefined } from '../utils/type-util.ts';
import { PrimitiveParser, Uint8 } from './primitive-parser.ts';

export type ArrayParserOptionNumber = ContextCompute<number> | PrimitiveParser<number> | number;
export type ArrayParserOptionEos = ContextCompute<number> | number | boolean;// 支持：1.指定结束于固定数字或者 2.根据下一个unit8判断
export type ArrayParserOptionUntil<T> = (prev: T, ctx: ParserContext, scope: ScopeAccessor, option: ContextOption) => boolean;

export type ArrayParserConfigRequired<T> = { item: BaseParser<T> | (new() => T) | ContextCompute<BaseParser<SafeAny> | (new() => SafeAny)> };
export type ArrayConfigLoopCount = { count: ArrayParserOptionNumber };
export type ArrayConfigLoopSize = { size: ArrayParserOptionNumber };
export type ArrayConfigLoopEnds = { ends: ArrayParserOptionEos };
export type ArrayParserLoopUntil<T> = { until: ArrayParserOptionUntil<T> };

export type ArrayParserIndexExpose = { index?: ContextCompute<string> | string }

export type ArrayParserReaderPartial<T> =
    & Partial<ArrayConfigLoopCount>
    & Partial<ArrayConfigLoopSize>
    & Partial<ArrayConfigLoopEnds>
    & Partial<ArrayParserLoopUntil<T>>;

export type ArrayParserConfigComputed<T> =
    | ArrayConfigLoopCount
    | ArrayConfigLoopSize
    | ArrayConfigLoopEnds
    | ArrayParserLoopUntil<T>;

export type ArrayParserConfig<T> =
    & AdvancedParserConfig
    & ArrayParserIndexExpose
    & ArrayParserConfigRequired<T>
    & ArrayParserConfigComputed<T>;

const DEFAULT_ENDS_FLAG = 0x00;
const endsFlag = (end?: number) => !isUndefined(end) ? end : DEFAULT_ENDS_FLAG;

export class ArrayParser<T> extends AdvancedParser<T[]> {
    private readonly item: BaseParser<T> | (new() => T) | ContextCompute<BaseParser<T> | (new() => T)>;
    private readonly count?: ArrayParserOptionNumber;
    private readonly size?: ArrayParserOptionNumber;
    private readonly ends?: ArrayParserOptionEos;
    private readonly until?: ArrayParserOptionUntil<T>;
    private readonly indexName: ContextCompute<string> | string;

    constructor(option: ArrayParserConfig<T>) {
        super(option);
        const { item, index, ...optionPartial } = option;
        const { count, size, ends, until } = optionPartial as ArrayParserReaderPartial<T>;
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
        this.until = until;
    }

    resolveItemParser(ctx: ParserContext, item: BaseParser<T> | (new() => T) | ContextCompute<BaseParser<T> | (new() => T)>): BaseParser<T> {
        if (item instanceof BaseParser) return item;
        if (!isFunction(item)) throw Error('unknown array item parser type');
        const parserCached = getTypedParser(item as Constructor<SafeAny>);
        if (parserCached) return this.resolveItemParser(ctx, parserCached);
        if (!assertType<ContextCompute<BaseParser<T> | (new() => T)>>(item)) throw Error('never');
        return this.resolveItemParser(ctx, ctx.compute(item));
    }

    readConfigNumber(ctx: ParserContext, config: ArrayParserOptionNumber, option?: Partial<ContextOption>): SnapTuple<number> {
        if (config instanceof PrimitiveParser) return ctx.read(config, option);
        if (isFunction(config)) return ctx.result(ctx.compute(config), 0);
        if (isNumber(config)) return ctx.result(config, 0);
        throw Error('one of NumberOption is not valid');
    }

    writeConfigNumber(ctx: ParserContext, config: ArrayParserOptionNumber, value: number, option?: Partial<ContextOption>): SnapTuple<number> {
        if (config instanceof PrimitiveParser) return ctx.write(config, value, option);
        if (isFunction(value) || isNumber(value)) return ctx.result(value, 0);
        throw Error('one of NumberOption is not valid');
    }

    endsCompute(ctx: ParserContext) {
        const ends = this.ends!;
        if (isBoolean(ends)) return endsFlag(ctx.option.ends);
        if (isNumber(ends)) return ends;
        return ctx.compute(ends);
    }

    read(ctx: ParserContext): T[] {
        const { item, indexName, count, size, ends, until } = this;
        const itemParser = this.resolveItemParser(ctx, item);

        const $index = isFunction(indexName) ? ctx.compute(indexName) : indexName;
        const items: T[] = [];

        const parentPath = ctx.scope[ctx.constant.$path];

        if (!isUndefined(count)) {
            // 使用传入的 count 选项获取数组长度
            const [ countValue ] = this.readConfigNumber(ctx, count);
            for (let readIndex = 0; readIndex < countValue; readIndex++) {
                ctx.expose($index, items.length);
                ctx.expose(ctx.constant.$path, `${parentPath}[${items.length}]`);
                const [ itemValue ] = ctx.read(itemParser);
                items.push(itemValue);
            }
        }

        if (!isUndefined(size)) {
            // 使用传入的 size 选项获取数组长度
            const [ sizeValue, sizeSnap ] = this.readConfigNumber(ctx, size);

            while (true) {
                ctx.expose($index, items.length);
                ctx.expose(ctx.constant.$path, `${parentPath}[${items.length}]`);
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
                ctx.expose(ctx.constant.$path, `${parentPath}[${items.length}]`);
                const [ next ] = ctx.read(Uint8, { consume: false });
                if (next === endsJudge) break;
                const [ itemValue ] = ctx.read(itemParser);
                items.push(itemValue);
            }
            ctx.read(Uint8);
        }

        if (!isUndefined(until)) {
            while (true) {
                ctx.expose($index, items.length);
                ctx.expose(ctx.constant.$path, `${parentPath}[${items.length}]`);
                const [ itemValue ] = ctx.read(itemParser);
                items.push(itemValue);
                if (ctx.compute(until.bind(void 0, itemValue))) break;
            }
        }

        return items;
    }

    write(ctx: ParserContext, items: T[]): T[] {
        const { item, indexName, count, size, ends, until } = this;
        const itemParser = this.resolveItemParser(ctx, item);
        const $index = isFunction(indexName) ? ctx.compute(indexName) : indexName;

        if (!isUndefined(count)) {
            // 使用传入的 count 选项写入数组长度
            this.writeConfigNumber(ctx, count, items.length);
            for (const [ idx, item ] of items.entries()) {
                ctx.expose($index, idx);
                ctx.write(itemParser, item);
            }
        }

        if (!isUndefined(size)) {
            // 使用传入的 size 选项写入数组长度（暂时未知具体长度，先写0，以获取offset）
            this.writeConfigNumber(ctx, size, 0);
            const beforeSize = ctx.size;

            for (const [ idx, item ] of items.entries()) {
                ctx.expose($index, idx);
                ctx.write(itemParser, item);
            }

            // 回到初始位置，写入正确的size
            const afterSize = ctx.size;
            this.writeConfigNumber(ctx, size, afterSize - beforeSize, { point: ctx.start, consume: false });
        }

        if (!isUndefined(ends)) {
            const endsMark = this.endsCompute(ctx);

            for (const [ idx, item ] of items.entries()) {
                const prevEnd = ctx.end;
                ctx.expose($index, idx);
                ctx.write(itemParser, item);
                const [ startByte ] = ctx.read(Uint8, { point: prevEnd, consume: false });
                if (startByte === endsMark) throw Error('Matching the \'ends\' byte too early');
            }

            ctx.write(Uint8, endsMark);
        }

        if (!isUndefined(until)) {
            const lastIndex = items.length - 1;
            for (const [ idx, item ] of items.entries()) {
                ctx.expose($index, idx);
                ctx.write(itemParser, item);
                const matchedUntil = ctx.compute(until.bind(void 0, item));
                if (matchedUntil && idx !== lastIndex) throw Error('Matching the \'until\' logic too early');
                if (!matchedUntil && idx === lastIndex) throw Error('Last item does not match the \'until\' logic');
            }
        }

        return items;
    }
}

const ArrayParserCreator = createParserCreator(ArrayParser);

export {
    ArrayParserCreator,
    ArrayParserCreator as Array,
    ArrayParserCreator as array,
};
