import { ParserContext } from '../context/types.ts';
import * as TypedArray from '../describe/typed-array.ts';
import { TypedArrayFactory, TypedArrayInstance } from '../describe/typed-array.ts';
import { ArrayParser, ArrayParserConfigComputed, ArrayParserConfig } from './array-parser.ts';
import { AdvancedParser } from '../context/base-parser.ts';
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

function createClass<Item, Instance extends TypedArrayInstance<Item, Instance>>(
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
    Int8Array = createClass(TypedArray.Int8Array, Int8),
    Uint8Array = createClass(TypedArray.Uint8Array, Uint8),
    Int16Array = createClass(TypedArray.Int16Array, Int16),
    Uint16Array = createClass(TypedArray.Uint16Array, Uint16),
    Int32Array = createClass(TypedArray.Int32Array, Int32),
    Uint32Array = createClass(TypedArray.Uint32Array, Uint32),
    Float32Array = createClass(TypedArray.Float32Array, Float32),
    Float64Array = createClass(TypedArray.Float64Array, Float64),
    BigInt64Array = createClass(TypedArray.BigInt64Array, BigInt64),
    BigUint64Array = createClass(TypedArray.BigUint64Array, BigUint64);

export const
    Int16BEArray = createClass(TypedArray.Int16Array, Int16BE),
    Uint16BEArray = createClass(TypedArray.Uint16Array, Uint16BE),
    Int32BEArray = createClass(TypedArray.Int32Array, Int32BE),
    Uint32BEArray = createClass(TypedArray.Uint32Array, Uint32BE),
    Float32BEArray = createClass(TypedArray.Float32Array, Float32BE),
    Float64BEArray = createClass(TypedArray.Float64Array, Float64BE),
    BigInt64BEArray = createClass(TypedArray.BigInt64Array, BigInt64BE),
    BigUint64BEArray = createClass(TypedArray.BigUint64Array, BigUint64BE);

export const
    Int16LEArray = createClass(TypedArray.Int16Array, Int16LE),
    Uint16LEArray = createClass(TypedArray.Uint16Array, Uint16LE),
    Int32LEArray = createClass(TypedArray.Int32Array, Int32LE),
    Uint32LEArray = createClass(TypedArray.Uint32Array, Uint32LE),
    Float32LEArray = createClass(TypedArray.Float32Array, Float32LE),
    Float64LEArray = createClass(TypedArray.Float64Array, Float64LE),
    BigInt64LEArray = createClass(TypedArray.BigInt64Array, BigInt64LE),
    BigUint64LEArray = createClass(TypedArray.BigUint64Array, BigUint64LE);

export {
    Int8Array as i8s, Uint8Array as u8s,

    Int16Array as i16s, Uint16Array as u16s,
    Int16BEArray as i16bes, Uint16BEArray as u16bes,
    Int16LEArray as i16les, Uint16LEArray as u16les,

    Int32Array as i32s, Uint32Array as u32s,
    Int32BEArray as i32bes, Uint32BEArray as u32bes,
    Int32LEArray as i32les, Uint32LEArray as u32les,

    BigInt64Array as bi64s, BigUint64Array as bu64s,
    BigInt64BEArray as bi64bes, BigUint64BEArray as bu64bes,
    BigInt64LEArray as bi64les, BigUint64LEArray as bu64les,

    Float32Array as f32s,
    Float32BEArray as f32bes,
    Float32LEArray as f32les,

    Float64Array as f64s,
    Float64LEArray as f64les,
    Float64BEArray as f64bes,
};
