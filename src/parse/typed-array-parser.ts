import { AdvancedParser, createParserCreator } from '../context/base-parser.ts';
import { ParserContext } from '../context/types.ts';
import * as TypedArray from '../describe/typed-array.ts';
import { TypedArrayFactory, TypedArrayInstance } from '../describe/typed-array.ts';
import { ArrayParser, ArrayParserConfig, ArrayParserConfigComputed } from './array-parser.ts';
import {
    PrimitiveParser,
    Int8, Uint8,
    Int16, Uint16, Int16BE, Uint16BE, Int16LE, Uint16LE,
    Int32, Uint32, Int32BE, Uint32BE, Int32LE, Uint32LE,
    BigInt64, BigUint64, BigInt64BE, BigUint64BE, BigInt64LE, BigUint64LE,
    Float32, Float32BE, Float32LE,
    Float64, Float64LE, Float64BE,
} from './primitive-parser.ts';

class BaseTypedArrayParser<Item, Instance extends TypedArrayInstance<Item, Instance>> extends AdvancedParser<Instance> {
    private readonly typedFactory: TypedArrayFactory<Item, Instance>;
    private readonly basicArrayParser: ArrayParser<Item>;

    constructor(typedFactory: TypedArrayFactory<Item, Instance>, config: ArrayParserConfig<Item>) {
        super(config);
        this.typedFactory = typedFactory;
        this.basicArrayParser = new ArrayParser<Item>(config);
    }

    read(ctx: ParserContext): Instance {
        const [ baseArray ] = ctx.read(this.basicArrayParser);
        return this.typedFactory.from(baseArray);
    }

    write(ctx: ParserContext, value: Instance): Instance {
        ctx.write(this.basicArrayParser, Array.from(value));
        return value;
    }
}

function extendBaseTypedArrayParser<Item, Instance extends TypedArrayInstance<Item, Instance>>(
    constructor: TypedArrayFactory<Item, Instance>,
    item: PrimitiveParser<Item>,
): (new(option: ArrayParserConfigComputed) => BaseTypedArrayParser<Item, Instance>) {
    return class TypedArrayParser extends BaseTypedArrayParser<Item, Instance> {
        constructor(option: ArrayParserConfigComputed) {
            super(constructor, { ...option, item });
        }
    };
}

export const
    Int8ArrayParser = extendBaseTypedArrayParser(TypedArray.Int8Array, Int8),
    Uint8ArrayParser = extendBaseTypedArrayParser(TypedArray.Uint8Array, Uint8),
    Int16ArrayParser = extendBaseTypedArrayParser(TypedArray.Int16Array, Int16),
    Uint16ArrayParser = extendBaseTypedArrayParser(TypedArray.Uint16Array, Uint16),
    Int32ArrayParser = extendBaseTypedArrayParser(TypedArray.Int32Array, Int32),
    Uint32ArrayParser = extendBaseTypedArrayParser(TypedArray.Uint32Array, Uint32),
    Float32ArrayParser = extendBaseTypedArrayParser(TypedArray.Float32Array, Float32),
    Float64ArrayParser = extendBaseTypedArrayParser(TypedArray.Float64Array, Float64),
    BigInt64ArrayParser = extendBaseTypedArrayParser(TypedArray.BigInt64Array, BigInt64),
    BigUint64ArrayParser = extendBaseTypedArrayParser(TypedArray.BigUint64Array, BigUint64);

export const
    Int16BEArrayParser = extendBaseTypedArrayParser(TypedArray.Int16Array, Int16BE),
    Uint16BEArrayParser = extendBaseTypedArrayParser(TypedArray.Uint16Array, Uint16BE),
    Int32BEArrayParser = extendBaseTypedArrayParser(TypedArray.Int32Array, Int32BE),
    Uint32BEArrayParser = extendBaseTypedArrayParser(TypedArray.Uint32Array, Uint32BE),
    Float32BEArrayParser = extendBaseTypedArrayParser(TypedArray.Float32Array, Float32BE),
    Float64BEArrayParser = extendBaseTypedArrayParser(TypedArray.Float64Array, Float64BE),
    BigInt64BEArrayParser = extendBaseTypedArrayParser(TypedArray.BigInt64Array, BigInt64BE),
    BigUint64BEArrayParser = extendBaseTypedArrayParser(TypedArray.BigUint64Array, BigUint64BE);

export const
    Int16LEArrayParser = extendBaseTypedArrayParser(TypedArray.Int16Array, Int16LE),
    Uint16LEArrayParser = extendBaseTypedArrayParser(TypedArray.Uint16Array, Uint16LE),
    Int32LEArrayParser = extendBaseTypedArrayParser(TypedArray.Int32Array, Int32LE),
    Uint32LEArrayParser = extendBaseTypedArrayParser(TypedArray.Uint32Array, Uint32LE),
    Float32LEArrayParser = extendBaseTypedArrayParser(TypedArray.Float32Array, Float32LE),
    Float64LEArrayParser = extendBaseTypedArrayParser(TypedArray.Float64Array, Float64LE),
    BigInt64LEArrayParser = extendBaseTypedArrayParser(TypedArray.BigInt64Array, BigInt64LE),
    BigUint64LEArrayParser = extendBaseTypedArrayParser(TypedArray.BigUint64Array, BigUint64LE);

const
    Int8ArrayCreator = createParserCreator(Int8ArrayParser),
    Uint8ArrayCreator = createParserCreator(Uint8ArrayParser),
    Int16ArrayCreator = createParserCreator(Int16ArrayParser),
    Uint16ArrayCreator = createParserCreator(Uint16ArrayParser),
    Int32ArrayCreator = createParserCreator(Int32ArrayParser),
    Uint32ArrayCreator = createParserCreator(Uint32ArrayParser),
    Float32ArrayCreator = createParserCreator(Float32ArrayParser),
    Float64ArrayCreator = createParserCreator(Float64ArrayParser),
    BigInt64ArrayCreator = createParserCreator(BigInt64ArrayParser),
    BigUint64ArrayCreator = createParserCreator(BigUint64ArrayParser);

const
    Int16BEArrayCreator = createParserCreator(Int16BEArrayParser),
    Uint16BEArrayCreator = createParserCreator(Uint16BEArrayParser),
    Int32BEArrayCreator = createParserCreator(Int32BEArrayParser),
    Uint32BEArrayCreator = createParserCreator(Uint32BEArrayParser),
    Float32BEArrayCreator = createParserCreator(Float32BEArrayParser),
    Float64BEArrayCreator = createParserCreator(Float64BEArrayParser),
    BigInt64BEArrayCreator = createParserCreator(BigInt64BEArrayParser),
    BigUint64BEArrayCreator = createParserCreator(BigUint64BEArrayParser);

const
    Int16LEArrayCreator = createParserCreator(Int16LEArrayParser),
    Uint16LEArrayCreator = createParserCreator(Uint16LEArrayParser),
    Int32LEArrayCreator = createParserCreator(Int32LEArrayParser),
    Uint32LEArrayCreator = createParserCreator(Uint32LEArrayParser),
    Float32LEArrayCreator = createParserCreator(Float32LEArrayParser),
    Float64LEArrayCreator = createParserCreator(Float64LEArrayParser),
    BigInt64LEArrayCreator = createParserCreator(BigInt64LEArrayParser),
    BigUint64LEArrayCreator = createParserCreator(BigUint64LEArrayParser);

export {
    Int8ArrayCreator, Int8ArrayCreator as Int8Array, Int8ArrayCreator as int8Array,
    Uint8ArrayCreator, Uint8ArrayCreator as Uint8Array, Uint8ArrayCreator as uint8Array,
    Int16ArrayCreator, Int16ArrayCreator as Int16Array, Int16ArrayCreator as int16Array,
    Uint16ArrayCreator, Uint16ArrayCreator as Uint16Array, Uint16ArrayCreator as uint16Array,
    Int32ArrayCreator, Int32ArrayCreator as Int32Array, Int32ArrayCreator as int32Array,
    Uint32ArrayCreator, Uint32ArrayCreator as Uint32Array, Uint32ArrayCreator as uint32Array,
    Float32ArrayCreator, Float32ArrayCreator as Float32Array, Float32ArrayCreator as float32Array,
    Float64ArrayCreator, Float64ArrayCreator as Float64Array, Float64ArrayCreator as float64Array,
    BigInt64ArrayCreator, BigInt64ArrayCreator as BigInt64Array, BigInt64ArrayCreator as bigInt64Array,
    BigUint64ArrayCreator, BigUint64ArrayCreator as BigUint64Array, BigUint64ArrayCreator as bigUint64Array,
    Int16BEArrayCreator, Int16BEArrayCreator as Int16BEArray, Int16BEArrayCreator as int16BEArray,
    Uint16BEArrayCreator, Uint16BEArrayCreator as Uint16BEArray, Uint16BEArrayCreator as uint16BEArray,
    Int32BEArrayCreator, Int32BEArrayCreator as Int32BEArray, Int32BEArrayCreator as int32BEArray,
    Uint32BEArrayCreator, Uint32BEArrayCreator as Uint32BEArray, Uint32BEArrayCreator as uint32BEArray,
    Float32BEArrayCreator, Float32BEArrayCreator as Float32BEArray, Float32BEArrayCreator as float32BEArray,
    Float64BEArrayCreator, Float64BEArrayCreator as Float64BEArray, Float64BEArrayCreator as float64BEArray,
    BigInt64BEArrayCreator, BigInt64BEArrayCreator as BigInt64BEArray, BigInt64BEArrayCreator as bigInt64BEArray,
    BigUint64BEArrayCreator, BigUint64BEArrayCreator as BigUint64BEArray, BigUint64BEArrayCreator as bigUint64BEArray,
    Int16LEArrayCreator, Int16LEArrayCreator as Int16LEArray, Int16LEArrayCreator as int16LEArray,
    Uint16LEArrayCreator, Uint16LEArrayCreator as Uint16LEArray, Uint16LEArrayCreator as uint16LEArray,
    Int32LEArrayCreator, Int32LEArrayCreator as Int32LEArray, Int32LEArrayCreator as int32LEArray,
    Uint32LEArrayCreator, Uint32LEArrayCreator as Uint32LEArray, Uint32LEArrayCreator as uint32LEArray,
    Float32LEArrayCreator, Float32LEArrayCreator as Float32LEArray, Float32LEArrayCreator as float32LEArray,
    Float64LEArrayCreator, Float64LEArrayCreator as Float64LEArray, Float64LEArrayCreator as float64LEArray,
    BigInt64LEArrayCreator, BigInt64LEArrayCreator as BigInt64LEArray, BigInt64LEArrayCreator as bigInt64LEArray,
    BigUint64LEArrayCreator, BigUint64LEArrayCreator as BigUint64LEArray, BigUint64LEArrayCreator as bigUint64LEArray,

    Int8ArrayCreator as i8s, Uint8ArrayCreator as u8s,
    Int16ArrayCreator as i16s, Uint16ArrayCreator as u16s,
    Int16BEArrayCreator as i16bes, Uint16BEArrayCreator as u16bes,
    Int16LEArrayCreator as i16les, Uint16LEArrayCreator as u16les,

    Int32ArrayCreator as i32s, Uint32ArrayCreator as u32s,
    Int32BEArrayCreator as i32bes, Uint32BEArrayCreator as u32bes,
    Int32LEArrayCreator as i32les, Uint32LEArrayCreator as u32les,

    BigInt64ArrayCreator as bi64s, BigUint64ArrayCreator as bu64s,
    BigInt64BEArrayCreator as bi64bes, BigUint64BEArrayCreator as bu64bes,
    BigInt64LEArrayCreator as bi64les, BigUint64LEArrayCreator as bu64les,

    Float32ArrayCreator as f32s,
    Float32BEArrayCreator as f32bes,
    Float32LEArrayCreator as f32les,

    Float64ArrayCreator as f64s,
    Float64LEArrayCreator as f64les,
    Float64BEArrayCreator as f64bes,
};
