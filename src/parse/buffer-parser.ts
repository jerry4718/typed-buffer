import { changeTypedArrayEndianness, Endian, NATIVE_ENDIANNESS } from '../utils/endianness-util.ts';
import { AdvancedParser, AdvancedParserConfig } from '../context/base-parser.ts';
import { ParserContext } from '../context/types.ts';
import { TypedArrayConstructor, TypedArrayInstance } from '../describe/typed-array.ts';
import { Constructor } from '../utils/prototype-util.ts';

export type BufferParserConfig<T extends object, Item extends (bigint | number), Instance extends TypedArrayInstance<Item, Instance>> =
    & AdvancedParserConfig
      & {
          typedArrayClass: TypedArrayConstructor<Item, Instance>,
          endian?: Endian,
          structClass: Constructor<T>,
          structFields: { name: keyof T }[],
      }

export class BufferParser<T extends object, Item extends (bigint | number), Instance extends TypedArrayInstance<Item, Instance>> extends AdvancedParser<T> {
    private readonly bufferStructClass: Constructor<T>;
    private readonly structBufferKey: symbol;
    private readonly structFields: { name: keyof T; }[];
    private readonly typedArrayClass: TypedArrayConstructor<Item, Instance>;
    private readonly endian?: Endian;
    readonly bytesPerField: number;
    readonly structFieldsCount: number;
    readonly structBufferSize: number;

    constructor(config: BufferParserConfig<T, Item, Instance>) {
        super(config);
        const structClass = config.structClass;
        const structFields = config.structFields;
        const structFieldsCount = structFields.length;

        const typedArrayClass = config.typedArrayClass;

        const typedArrayCreator = () => Reflect.construct(typedArrayClass, [ structFieldsCount ]);

        const kBuffer = Symbol(`@@${structClass.name}.buffer`);
        const kGetter = Symbol(`@@${structClass.name}.getter`);
        const kSetter = Symbol(`@@${structClass.name}.setter`);
        const kEnsure = Symbol(`@@${structClass.name}.ensure`);

        class BufferStruct extends structClass {
            private [kBuffer]: TypedArrayInstance<Item, Instance>;

            constructor(buffer: TypedArrayInstance<Item, Instance>) {
                super();
                this[kBuffer] = buffer;
            }

            private [kEnsure]() {
                if (this[kBuffer]) return;
                this[kBuffer] = typedArrayCreator();
            }

            private [kGetter](kdx: number): Item {
                return this[kBuffer][kdx];
            }

            private [kSetter](kdx: number, value: Item) {
                this[kEnsure]();
                return this[kBuffer][kdx] = value;
            }
        }

        const proto = BufferStruct.prototype;

        for (const [ fdx, field ] of structFields.entries()) {
            Reflect.defineProperty(proto, field.name, {
                get() { return this[kGetter](fdx); },
                set(value: Item) { return this[kSetter](fdx, value); },
            });
        }

        this.bufferStructClass = BufferStruct as Constructor<T>;
        this.structBufferKey = kBuffer;
        this.structFields = structFields;
        this.typedArrayClass = typedArrayClass;
        this.endian = config.endian;
        this.structFieldsCount = structFieldsCount;
        this.bytesPerField = typedArrayClass.BYTES_PER_ELEMENT;
        this.structBufferSize = structFieldsCount * typedArrayClass.BYTES_PER_ELEMENT;
    }

    sizeof(): number {
        return this.structBufferSize;
    }

    resolveEndianness(ctx: ParserContext, from: TypedArrayInstance<Item, Instance>): TypedArrayInstance<Item, Instance> {
        const endian = this.endian || ctx.constant.endian;
        if (!endian) return from;
        if (endian === NATIVE_ENDIANNESS) return from;
        return changeTypedArrayEndianness(from);
    }

    read(ctx: ParserContext, byteOffset: number): T {
        const buffer = ctx.buffer.slice(byteOffset, byteOffset + this.structBufferSize);
        const typedArray = Reflect.construct(this.typedArrayClass, [ buffer ]);
        return Reflect.construct(this.bufferStructClass, [ this.resolveEndianness(ctx, typedArray) ]) as T;
    }

    write(ctx: ParserContext, value: T, byteOffset: number): T {
        const typedArray =
            value instanceof this.bufferStructClass
                ? Reflect.get(value, this.structBufferKey) as TypedArrayInstance<Item, Instance>
                : this.typedArrayClass.from(this.structFields.map(f => Reflect.get(value, f.name)));

        const valueTypedArray = this.resolveEndianness(ctx, typedArray);

        const buffer = ctx.buffer.slice(byteOffset, byteOffset + this.structBufferSize);
        const writeTypedArray = Reflect.construct(this.typedArrayClass, [ buffer ]);
        writeTypedArray.set(valueTypedArray);
        return value;
    }
}
