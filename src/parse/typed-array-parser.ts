import { AdvancedParser, AdvancedParserConfig, createParserCreator } from '../context/base-parser.ts';
import { ContextCompute, ContextOption, ParserContext, ScopeAccessor } from '../context/types.ts';
import * as TypedArray from '../describe/typed-array.ts';
import { TypedArrayConstructor, TypedArrayFactory, TypedArrayInstance } from '../describe/typed-array.ts';
import * as PrimitiveType from './primitive-parser.ts';
import { PrimitiveParser } from './primitive-parser.ts';
import { isBoolean, isFunction, isNumber, isUndefined } from '../utils/type-util.ts';
import { SnapTuple } from '../context/snap-tuple.ts';
import { changeTypedArrayEndianness, NATIVE_ENDIANNESS } from '../utils/endianness-util.ts';

export type TypedArrayParserOptionNumber = ContextCompute<number> | PrimitiveParser<number> | number;
export type TypedArrayParserOptionEos = ContextCompute<number> | number | boolean;// 支持：1.指定结束于固定数字或者 2.根据下一个unit8判断
export type TypedArrayParserOptionUntil<T> = (prev: T, ctx: ParserContext, scope: ScopeAccessor, option: ContextOption) => boolean;

export type TypedArrayConfigLoopCount = { count: TypedArrayParserOptionNumber };
export type TypedArrayConfigLoopSize = { size: TypedArrayParserOptionNumber };
export type TypedArrayConfigLoopEnds = { ends: TypedArrayParserOptionEos };
export type TypedArrayParserLoopUntil<T> = { until: TypedArrayParserOptionUntil<T> };

export type TypedArrayParserReaderPartial<T> =
    & Partial<TypedArrayConfigLoopCount>
    & Partial<TypedArrayConfigLoopSize>
    & Partial<TypedArrayConfigLoopEnds>
    & Partial<TypedArrayParserLoopUntil<T>>;

export type TypedArrayParserConfigComputed<T> =
    | TypedArrayConfigLoopCount
    | TypedArrayConfigLoopSize
    | TypedArrayConfigLoopEnds
    | TypedArrayParserLoopUntil<T>;

export type TypedArrayParserConfig<T> =
    & AdvancedParserConfig
    & TypedArrayParserConfigComputed<T>;

const DEFAULT_ENDS_FLAG = 0x00;
const endsFlag = (end?: number) => !isUndefined(end) ? end : DEFAULT_ENDS_FLAG;

export class BaseTypedArrayParser<Item extends (number | bigint), Instance extends TypedArrayInstance<Item, Instance>> extends AdvancedParser<Instance> {
    private readonly itemParser: PrimitiveParser<Item>;
    private readonly typedConstructor: TypedArrayConstructor<Item, Instance>;
    private readonly BYTES_PER_ELEMENT: number;
    private readonly countOption?: TypedArrayParserOptionNumber;
    private readonly sizeOption?: TypedArrayParserOptionNumber;
    private readonly endsOption?: TypedArrayParserOptionEos;
    private readonly untilOption?: TypedArrayParserOptionUntil<Item>;

    constructor(itemParser: PrimitiveParser<Item>, typedConstructor: TypedArrayConstructor<Item, Instance>, option: TypedArrayParserConfig<Item>) {
        super(option);
        const { ...optionPartial } = option;
        const { count, size, ends, until } = optionPartial as TypedArrayParserReaderPartial<Item>;
        if (Number(!isUndefined(count)) + Number(!isUndefined(size)) + Number(!isUndefined(ends)) !== 1) {
            throw new Error('Invalid parser options. Only one of [size] or [end].');
        }
        this.itemParser = itemParser;
        this.typedConstructor = typedConstructor;
        this.BYTES_PER_ELEMENT = typedConstructor.BYTES_PER_ELEMENT;
        this.countOption = count;
        this.sizeOption = size;
        this.endsOption = ends;
        this.untilOption = until;
    }

    readConfigNumber(ctx: ParserContext, config: TypedArrayParserOptionNumber, option?: Partial<ContextOption>): SnapTuple<number> {
        if (config instanceof PrimitiveParser) return ctx.read(config, option);
        if (isFunction(config)) return ctx.result(ctx.compute(config), 0);
        if (isNumber(config)) return ctx.result(config, 0);
        throw Error('one of NumberOption is not valid');
    }

    writeConfigNumber(ctx: ParserContext, config: TypedArrayParserOptionNumber, value: number, option?: Partial<ContextOption>): SnapTuple<number> {
        if (config instanceof PrimitiveParser) return ctx.write(config, value, option);
        if (isFunction(value) || isNumber(value)) return ctx.result(value, 0);
        throw Error('one of NumberOption is not valid');
    }

    endsCompute(ctx: ParserContext) {
        const ends = this.endsOption!;
        if (isBoolean(ends)) return endsFlag(ctx.constant.ends);
        if (isNumber(ends)) return ends;
        return ctx.compute(ends);
    }

    sizeof(ctx?: ParserContext): number {
        const { countOption, sizeOption, endsOption, untilOption } = this;
        if (!isUndefined(endsOption)) return NaN;
        if (!isUndefined(untilOption)) return NaN;

        if (isNumber(sizeOption)) return sizeOption;
        if (!ctx) {
            if (!isUndefined(endsOption)) return NaN;
            if (!isUndefined(untilOption)) return NaN;
            if (!isUndefined(sizeOption)) return NaN;

            if (isNumber(countOption)) {
                return countOption * this.BYTES_PER_ELEMENT;
            }

            return NaN;
        }

        if (!isUndefined(sizeOption)) {
            // 使用传入的 size 选项获取数组长度
            const [ sizeValue, sizeSnap ] = this.readConfigNumber(ctx, sizeOption, { consume: false });
            return sizeSnap.size + sizeValue;
        }

        return NaN;
    }

    resolveEndianness(ctx: ParserContext, from: Instance): Instance {
        const endian = this.itemParser.endian || ctx.constant.endian;
        if (!endian) return from;
        if (endian === NATIVE_ENDIANNESS) return from;
        return changeTypedArrayEndianness(from);
    }

    read(ctx: ParserContext): Instance {
        return this.resolveEndianness(ctx, this.innerRead(ctx));
    }

    write(ctx: ParserContext, typedArray: Instance): Instance {
        this.innerWrite(ctx, this.resolveEndianness(ctx, typedArray));
        return typedArray;
    }

    private innerRead(ctx: ParserContext): Instance {
        const { countOption, sizeOption, endsOption, untilOption } = this;

        if (!isUndefined(countOption)) {
            // 使用传入的 count 选项获取数组长度
            const [ countValue ] = this.readConfigNumber(ctx, countOption);
            const buffer = ctx.buffer.slice(ctx.end, ctx.end + countValue * this.BYTES_PER_ELEMENT);
            ctx.skip(countValue * this.BYTES_PER_ELEMENT);
            return Reflect.construct(this.typedConstructor, [ buffer ]) as Instance;
        }

        if (!isUndefined(sizeOption)) {
            // 使用传入的 size 选项获取数组长度
            const [ sizeValue ] = this.readConfigNumber(ctx, sizeOption);
            const buffer = ctx.buffer.slice(ctx.end, ctx.end + sizeValue);
            ctx.skip(sizeValue);
            return Reflect.construct(this.typedConstructor, [ buffer ]) as Instance;
        }

        if (!isUndefined(endsOption)) {
            // 使用 endsJudge 来确定读取Array的长度
            const endsJudge = this.endsCompute(ctx);

            const pointBefore = ctx.end;
            let pointOffset = 0;
            while (true) {
                const [ next ] = ctx.read(PrimitiveType.Uint8, { consume: false, point: pointBefore + pointOffset });
                if (next === endsJudge) break;
                pointOffset += this.BYTES_PER_ELEMENT;
            }
            const buffer = ctx.buffer.slice(pointBefore, pointBefore + pointOffset);
            ctx.skip(pointOffset);
            ctx.read(PrimitiveType.Uint8, { consume: true });
            return Reflect.construct(this.typedConstructor, [ buffer ]) as Instance;
        }

        if (!isUndefined(untilOption)) {
            const pointBefore = ctx.end;
            let pointOffset = 0;

            while (true) {
                const [ itemValue ] = ctx.read(this.itemParser, { consume: false, point: pointBefore + pointOffset });
                pointOffset += this.BYTES_PER_ELEMENT;
                if (ctx.compute(untilOption.bind(void 0, itemValue as Item))) break;
            }
            const buffer = ctx.buffer.slice(ctx.end, ctx.end + pointOffset);
            ctx.skip(pointOffset);
            return Reflect.construct(this.typedConstructor, [ buffer ]) as Instance;
        }

        throw Error('unknown TypedArray option');
    }

    private innerWrite(ctx: ParserContext, typedArray: Instance) {
        const { countOption, sizeOption, endsOption, untilOption } = this;

        const countValue = typedArray.length;
        const sizeValue = typedArray.byteLength;

        if (!isUndefined(countOption)) {
            // 使用传入的 count 选项写入数组长度
            this.writeConfigNumber(ctx, countOption, countValue);
            const writeView = Reflect.construct(this.typedConstructor, [ ctx.buffer, ctx.end, countValue ]) as Instance;
            writeView.set(typedArray);
            ctx.skip(sizeValue);
            return;
        }

        if (!isUndefined(sizeOption)) {
            // 使用传入的 size 选项写入数组长度（暂时未知具体长度，先写0，以获取offset）
            this.writeConfigNumber(ctx, sizeOption, sizeValue);
            const writeView = Reflect.construct(this.typedConstructor, [ ctx.buffer, ctx.end, countValue ]) as Instance;
            writeView.set(typedArray);
            ctx.skip(sizeValue);
            return;
        }

        if (!isUndefined(endsOption)) {
            const endsMark = this.endsCompute(ctx);
            const writeView = Reflect.construct(this.typedConstructor, [ ctx.buffer, ctx.end, countValue ]) as Instance;
            writeView.set(typedArray);
            ctx.skip(sizeValue);
            ctx.write(PrimitiveType.Uint8, endsMark);
            return;
        }

        if (!isUndefined(untilOption)) {
            const lastIndex = typedArray.length - 1;
            const writeView = Reflect.construct(this.typedConstructor, [ ctx.buffer, ctx.end, countValue ]) as Instance;
            for (const [ idx, item ] of typedArray.entries()) {
                const matchedUntil = ctx.compute(untilOption.bind(void 0, item));
                if (matchedUntil && idx !== lastIndex) throw Error('Matching the \'until\' logic too early');
                if (!matchedUntil && idx === lastIndex) throw Error('Last item does not match the \'until\' logic');
            }
            writeView.set(typedArray);
            ctx.skip(sizeValue);
            return;
        }

        throw Error('unknown TypedArray option');
    }
}

function compose<Item extends (bigint | number), Instance extends TypedArrayInstance<Item, Instance>>(
    item: PrimitiveParser<Item>,
    constructor: TypedArrayFactory<Item, Instance>,
): (new(option: TypedArrayParserConfig<Item>) => BaseTypedArrayParser<Item, Instance>) {
    return class TypedArrayParser extends BaseTypedArrayParser<Item, Instance> {
        constructor(option: TypedArrayParserConfig<Item>) {
            super(item, constructor, option);
        }
    };
}

export const
    Int8ArrayParserCreator = createParserCreator(compose(PrimitiveType.Int8, TypedArray.Int8Array)),
    Uint8ArrayParserCreator = createParserCreator(compose(PrimitiveType.Uint8, TypedArray.Uint8Array)),
    Int16ArrayParserCreator = createParserCreator(compose(PrimitiveType.Int16, TypedArray.Int16Array)),
    Uint16ArrayParserCreator = createParserCreator(compose(PrimitiveType.Uint16, TypedArray.Uint16Array)),
    Int32ArrayParserCreator = createParserCreator(compose(PrimitiveType.Int32, TypedArray.Int32Array)),
    Uint32ArrayParserCreator = createParserCreator(compose(PrimitiveType.Uint32, TypedArray.Uint32Array)),
    Float32ArrayParserCreator = createParserCreator(compose(PrimitiveType.Float32, TypedArray.Float32Array)),
    Float64ArrayParserCreator = createParserCreator(compose(PrimitiveType.Float64, TypedArray.Float64Array)),
    BigInt64ArrayParserCreator = createParserCreator(compose(PrimitiveType.BigInt64, TypedArray.BigInt64Array)),
    BigUint64ArrayParserCreator = createParserCreator(compose(PrimitiveType.BigUint64, TypedArray.BigUint64Array));

export const
    Int16BEArrayParserCreator = createParserCreator(compose(PrimitiveType.Int16BE, TypedArray.Int16Array)),
    Uint16BEArrayParserCreator = createParserCreator(compose(PrimitiveType.Uint16BE, TypedArray.Uint16Array)),
    Int32BEArrayParserCreator = createParserCreator(compose(PrimitiveType.Int32BE, TypedArray.Int32Array)),
    Uint32BEArrayParserCreator = createParserCreator(compose(PrimitiveType.Uint32BE, TypedArray.Uint32Array)),
    Float32BEArrayParserCreator = createParserCreator(compose(PrimitiveType.Float32BE, TypedArray.Float32Array)),
    Float64BEArrayParserCreator = createParserCreator(compose(PrimitiveType.Float64BE, TypedArray.Float64Array)),
    BigInt64BEArrayParserCreator = createParserCreator(compose(PrimitiveType.BigInt64BE, TypedArray.BigInt64Array)),
    BigUint64BEArrayParserCreator = createParserCreator(compose(PrimitiveType.BigUint64BE, TypedArray.BigUint64Array));

export const
    Int16LEArrayParserCreator = createParserCreator(compose(PrimitiveType.Int16LE, TypedArray.Int16Array)),
    Uint16LEArrayParserCreator = createParserCreator(compose(PrimitiveType.Uint16LE, TypedArray.Uint16Array)),
    Int32LEArrayParserCreator = createParserCreator(compose(PrimitiveType.Int32LE, TypedArray.Int32Array)),
    Uint32LEArrayParserCreator = createParserCreator(compose(PrimitiveType.Uint32LE, TypedArray.Uint32Array)),
    Float32LEArrayParserCreator = createParserCreator(compose(PrimitiveType.Float32LE, TypedArray.Float32Array)),
    Float64LEArrayParserCreator = createParserCreator(compose(PrimitiveType.Float64LE, TypedArray.Float64Array)),
    BigInt64LEArrayParserCreator = createParserCreator(compose(PrimitiveType.BigInt64LE, TypedArray.BigInt64Array)),
    BigUint64LEArrayParserCreator = createParserCreator(compose(PrimitiveType.BigUint64LE, TypedArray.BigUint64Array));

export {
    Int8ArrayParserCreator as Int8Array, Int8ArrayParserCreator as int8Array, Int8ArrayParserCreator as i8s,
    Uint8ArrayParserCreator as Uint8Array, Uint8ArrayParserCreator as uint8Array, Uint8ArrayParserCreator as u8s,
    Int16ArrayParserCreator as Int16Array, Int16ArrayParserCreator as int16Array, Int16ArrayParserCreator as i16s,
    Uint16ArrayParserCreator as Uint16Array, Uint16ArrayParserCreator as uint16Array, Uint16ArrayParserCreator as u16s,
    Int32ArrayParserCreator as Int32Array, Int32ArrayParserCreator as int32Array, Int32ArrayParserCreator as i32s,
    Uint32ArrayParserCreator as Uint32Array, Uint32ArrayParserCreator as uint32Array, Uint32ArrayParserCreator as u32s,
    Float32ArrayParserCreator as Float32Array, Float32ArrayParserCreator as float32Array, Float32ArrayParserCreator as f32s,
    Float64ArrayParserCreator as Float64Array, Float64ArrayParserCreator as float64Array, Float64ArrayParserCreator as f64s,
    BigInt64ArrayParserCreator as BigInt64Array, BigInt64ArrayParserCreator as bigInt64Array, BigInt64ArrayParserCreator as bi64s,
    BigUint64ArrayParserCreator as BigUint64Array, BigUint64ArrayParserCreator as bigUint64Array, BigUint64ArrayParserCreator as bu64s,
    Int16BEArrayParserCreator as Int16BEArray, Int16BEArrayParserCreator as int16BEArray, Int16BEArrayParserCreator as i16bes,
    Uint16BEArrayParserCreator as Uint16BEArray, Uint16BEArrayParserCreator as uint16BEArray, Uint16BEArrayParserCreator as u16bes,
    Int32BEArrayParserCreator as Int32BEArray, Int32BEArrayParserCreator as int32BEArray, Int32BEArrayParserCreator as i32bes,
    Uint32BEArrayParserCreator as Uint32BEArray, Uint32BEArrayParserCreator as uint32BEArray, Uint32BEArrayParserCreator as u32bes,
    Float32BEArrayParserCreator as Float32BEArray, Float32BEArrayParserCreator as float32BEArray, Float32BEArrayParserCreator as f32bes,
    Float64BEArrayParserCreator as Float64BEArray, Float64BEArrayParserCreator as float64BEArray, Float64BEArrayParserCreator as f64bes,
    BigInt64BEArrayParserCreator as BigInt64BEArray, BigInt64BEArrayParserCreator as bigInt64BEArray, BigInt64BEArrayParserCreator as bi64bes,
    BigUint64BEArrayParserCreator as BigUint64BEArray, BigUint64BEArrayParserCreator as bigUint64BEArray, BigUint64BEArrayParserCreator as bu64bes,
    Int16LEArrayParserCreator as Int16LEArray, Int16LEArrayParserCreator as int16LEArray, Int16LEArrayParserCreator as i16les,
    Uint16LEArrayParserCreator as Uint16LEArray, Uint16LEArrayParserCreator as uint16LEArray, Uint16LEArrayParserCreator as u16les,
    Int32LEArrayParserCreator as Int32LEArray, Int32LEArrayParserCreator as int32LEArray, Int32LEArrayParserCreator as i32les,
    Uint32LEArrayParserCreator as Uint32LEArray, Uint32LEArrayParserCreator as uint32LEArray, Uint32LEArrayParserCreator as u32les,
    Float32LEArrayParserCreator as Float32LEArray, Float32LEArrayParserCreator as float32LEArray, Float32LEArrayParserCreator as f32les,
    Float64LEArrayParserCreator as Float64LEArray, Float64LEArrayParserCreator as float64LEArray, Float64LEArrayParserCreator as f64les,
    BigInt64LEArrayParserCreator as BigInt64LEArray, BigInt64LEArrayParserCreator as bigInt64LEArray, BigInt64LEArrayParserCreator as bi64les,
    BigUint64LEArrayParserCreator as BigUint64LEArray, BigUint64LEArrayParserCreator as bigUint64LEArray, BigUint64LEArrayParserCreator as bu64les,
};
