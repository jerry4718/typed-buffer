import { AdvancedParser, AdvancedParserConfig, BaseParser, createParserCreator } from '../context/base-parser.ts';
import { ContextCompute, ContextOption, ParserContext, ScopeAccessor } from '../context/types.ts';
import { getTargetParser } from '../decorate/util.ts';
import { Constructor, SafeAny } from '../utils/prototype-util.ts';
import { assertType, isBoolean, isFunction, isNumber, isUndefined } from '../utils/type-util.ts';
import { PrimitiveParser, Uint8 } from './primitive-parser.ts';

export type ArrayParserOptionNumber = ContextCompute<number> | PrimitiveParser<number> | number;
export type ArrayParserOptionEos = ContextCompute<number> | number | boolean;// 支持：1.指定结束于固定数字或者 2.根据下一个unit8判断
export type ArrayParserOptionUntil<T> = (prev: T, ctx: ParserContext, scope: ScopeAccessor) => boolean;

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
    private readonly itemOption: BaseParser<T> | (new() => T) | ContextCompute<BaseParser<T> | (new() => T)>;
    private readonly indexName: ContextCompute<string> | string;
    private readonly countOption?: ArrayParserOptionNumber;
    private readonly sizeOption?: ArrayParserOptionNumber;
    private readonly endsOption?: ArrayParserOptionEos;
    private readonly untilOption?: ArrayParserOptionUntil<T>;

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
        this.itemOption = item;
        this.indexName = index || '$index';
        this.countOption = count;
        this.sizeOption = size;
        this.endsOption = ends;
        this.untilOption = until;
    }

    resolveItemParser(ctx: ParserContext, item: BaseParser<T> | (new() => T) | ContextCompute<BaseParser<T> | (new() => T)>): BaseParser<T> {
        if (item instanceof BaseParser) return item;
        if (!isFunction(item)) throw Error('unknown array item parser type');
        const parserCached = getTargetParser(item as Constructor<SafeAny>);
        if (parserCached) return this.resolveItemParser(ctx, parserCached);
        if (!assertType<ContextCompute<BaseParser<T> | (new() => T)>>(item)) throw Error('never');
        return this.resolveItemParser(ctx, ctx.compute(item));
    }

    readConfigNumber(ctx: ParserContext, config: ArrayParserOptionNumber, option?: Partial<ContextOption>): number {
        if (config instanceof PrimitiveParser) return ctx.read(config, option);
        if (isFunction(config)) return ctx.compute(config);
        if (isNumber(config)) return config;
        throw Error('one of NumberOption is not valid');
    }

    writeConfigNumber(ctx: ParserContext, config: ArrayParserOptionNumber, value: number, option?: Partial<ContextOption>): number {
        if (config instanceof PrimitiveParser) return ctx.write(config, value, option);
        if (isFunction(value) || isNumber(value)) return value;
        throw Error('one of NumberOption is not valid');
    }

    endsCompute(ctx: ParserContext) {
        const ends = this.endsOption!;
        if (isBoolean(ends)) return endsFlag(ctx.constant.ends);
        if (isNumber(ends)) return ends;
        return ctx.compute(ends);
    }

    read(ctx: ParserContext): T[] {
        const { itemOption, indexName, countOption, sizeOption, endsOption, untilOption } = this;
        const itemParser = this.resolveItemParser(ctx, itemOption);

        const $index = isFunction(indexName) ? ctx.compute(indexName) : indexName;
        const items: T[] = [];

        const parentPath = ctx.scope[ctx.constant.$path];

        if (!isUndefined(countOption)) {
            // 使用传入的 count 选项获取数组长度
            const countValue = this.readConfigNumber(ctx, countOption);
            for (let readIndex = 0; readIndex < countValue; readIndex++) {
                ctx.expose($index, items.length);
                ctx.expose(ctx.constant.$path, `${parentPath}[${items.length}]`);
                items.push(ctx.read(itemParser));
            }
        }

        if (!isUndefined(sizeOption)) {
            // 使用传入的 size 选项获取数组长度
            const sizeValue = this.readConfigNumber(ctx, sizeOption);
            const sizeEnd = ctx.end;

            while (true) {
                ctx.expose($index, items.length);
                ctx.expose(ctx.constant.$path, `${parentPath}[${items.length}]`);
                const collectSize = ctx.end - sizeEnd;
                if (collectSize > sizeValue) throw Error('Invalid array data read');
                if (collectSize === sizeValue) break;
                items.push(ctx.read(itemParser));
            }
        }

        if (!isUndefined(endsOption)) {
            // 使用 endsJudge 来确定读取Array的长度
            const endsJudge = this.endsCompute(ctx);

            while (true) {
                ctx.expose($index, items.length);
                ctx.expose(ctx.constant.$path, `${parentPath}[${items.length}]`);
                const next = ctx.read(Uint8, { consume: false });
                if (next === endsJudge) break;
                items.push(ctx.read(itemParser));
            }
            ctx.read(Uint8);
        }

        if (!isUndefined(untilOption)) {
            while (true) {
                ctx.expose($index, items.length);
                ctx.expose(ctx.constant.$path, `${parentPath}[${items.length}]`);
                const itemValue = ctx.read(itemParser);
                items.push(itemValue);
                if (ctx.compute(untilOption.bind(void 0, itemValue))) break;
            }
        }

        return items;
    }

    write(ctx: ParserContext, items: T[]): T[] {
        const { itemOption, indexName, countOption, sizeOption, endsOption, untilOption } = this;
        const itemParser = this.resolveItemParser(ctx, itemOption);
        const $index = isFunction(indexName) ? ctx.compute(indexName) : indexName;

        if (!isUndefined(countOption)) {
            // 使用传入的 count 选项写入数组长度
            this.writeConfigNumber(ctx, countOption, items.length);
            for (const [ idx, item ] of items.entries()) {
                ctx.expose($index, idx);
                ctx.write(itemParser, item);
            }
        }

        if (!isUndefined(sizeOption)) {
            // 使用传入的 size 选项写入数组长度（暂时未知具体长度，先写0，以获取offset）
            this.writeConfigNumber(ctx, sizeOption, 0);
            const beforeSize = ctx.size;

            for (const [ idx, item ] of items.entries()) {
                ctx.expose($index, idx);
                ctx.write(itemParser, item);
            }

            // 回到初始位置，写入正确的size
            const afterSize = ctx.size;
            this.writeConfigNumber(ctx, sizeOption, afterSize - beforeSize, { point: ctx.start, consume: false });
        }

        if (!isUndefined(endsOption)) {
            const endsMark = this.endsCompute(ctx);

            for (const [ idx, item ] of items.entries()) {
                const prevEnd = ctx.end;
                ctx.expose($index, idx);
                ctx.write(itemParser, item);
                const startByte = ctx.read(Uint8, { point: prevEnd, consume: false });
                if (startByte === endsMark) throw Error('Matching the \'ends\' byte too early');
            }

            ctx.write(Uint8, endsMark);
        }

        if (!isUndefined(untilOption)) {
            const lastIndex = items.length - 1;
            for (const [ idx, item ] of items.entries()) {
                ctx.expose($index, idx);
                ctx.write(itemParser, item);
                const matchedUntil = ctx.compute(untilOption.bind(void 0, item));
                if (matchedUntil && idx !== lastIndex) throw Error('Matching the \'until\' logic too early');
                if (!matchedUntil && idx === lastIndex) throw Error('Last item does not match the \'until\' logic');
            }
        }

        return items;
    }
}

interface ArrayParserOptionAdapter<T> {
    read(ctx: ParserContext): T[];

    write(ctx: ParserContext, items: T[]): T[];
}

class ArrayParserBaseAdapter<T> {
    startRead(ctx: ParserContext) {}

    startItem(ctx: ParserContext) {}

    endItem(ctx: ParserContext) {}

    endRead(ctx: ParserContext) {}

    resolveItemParser(ctx: ParserContext, item: BaseParser<T> | (new() => T) | ContextCompute<BaseParser<T> | (new() => T)>): BaseParser<T> {
        if (item instanceof BaseParser) return item;
        if (!isFunction(item)) throw Error('unknown array item parser type');
        const parserCached = getTargetParser(item as Constructor<SafeAny>);
        if (parserCached) return this.resolveItemParser(ctx, parserCached);
        if (!assertType<ContextCompute<BaseParser<T> | (new() => T)>>(item)) throw Error('never');
        return this.resolveItemParser(ctx, ctx.compute(item));
    }

    readConfigNumber(ctx: ParserContext, config: ArrayParserOptionNumber, option?: Partial<ContextOption>): number {
        if (config instanceof PrimitiveParser) return ctx.read(config, option);
        if (isFunction(config)) return ctx.compute(config);
        if (isNumber(config)) return config;
        throw Error('one of NumberOption is not valid');
    }
}

class ArrayParserCountAdapter<T> extends ArrayParserBaseAdapter<T> implements ArrayParserOptionAdapter<T> {
    constructor(
        private item: BaseParser<T> | (new() => T) | ContextCompute<BaseParser<T> | (new() => T)>,
        private count: ArrayParserOptionNumber,
    ) {
        super();
    }

    read(ctx: ParserContext): T[] {
        this.startRead(ctx);
        const itemParser = this.resolveItemParser(ctx, this.item);
        const countValue = this.readConfigNumber(ctx, this.count);
        const items: T[] = [];
        for (let readIndex = 0; readIndex < countValue; readIndex++) {
            this.startItem(ctx);
            items.push(ctx.read(itemParser));
            this.endItem(ctx);
        }
        this.endRead(ctx);
        return items;
    }

    write(ctx: ParserContext, items: T[]): T[] {
        return [];
    }
}

const ArrayParserCreator = createParserCreator(ArrayParser);

export {
    ArrayParserCreator,
    ArrayParserCreator as Array,
    ArrayParserCreator as array,
};
