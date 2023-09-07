import { changeTypedArrayEndianness, Endian, NATIVE_ENDIANNESS } from '../utils/endianness-util.ts';
import { AdvancedParser } from '../context/base-parser.ts';
import { ParserContext } from '../context/types.ts';
import { TypedArrayConstructor, TypedArrayInstance } from '../utils/typed-array.ts';
import { Constructor } from '../utils/prototype-util.ts';
import { PrimitiveParser } from "./primitive-parser.ts";

export type BufferParserConfig<T extends object, Item extends (bigint | number), Container extends TypedArrayInstance<Item, Container>> = {
    field: PrimitiveParser<Item, Container>,
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
    readonly bytesPerData: number;

    constructor(config: BufferParserConfig<T, Item, Instance>) {
        super();
        const structClass = config.structClass;
        const structFields = config.structFields;
        const structFieldsCount = structFields.length;

        const typedArrayClass = config.field.container;

        const typedArrayCreator = () => Reflect.construct(typedArrayClass, [ structFieldsCount ]);

        const kBuffer = Symbol(`@@${ structClass.name }.buffer`);
        const kGetter = Symbol(`@@${ structClass.name }.getter`);
        const kSetter = Symbol(`@@${ structClass.name }.setter`);
        const kEnsure = Symbol(`@@${ structClass.name }.ensure`);

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
        this.bytesPerData = structFieldsCount * typedArrayClass.BYTES_PER_ELEMENT;
    }

    resolveEndianness(ctx: ParserContext, from: TypedArrayInstance<Item, Instance>): TypedArrayInstance<Item, Instance> {
        const endian = this.endian || ctx.constant.endian;
        if (!endian) return from;
        if (endian === NATIVE_ENDIANNESS) return from;
        return changeTypedArrayEndianness(from);
    }

    read(ctx: ParserContext, byteOffset: number): T {
        const buffer = ctx.buffer.slice(byteOffset, byteOffset + this.bytesPerData);
        const typedArray = Reflect.construct(this.typedArrayClass, [ buffer ]);
        return Reflect.construct(this.bufferStructClass, [ this.resolveEndianness(ctx, typedArray) ]) as T;
    }

    write(ctx: ParserContext, value: T, byteOffset: number) {
        const typedArray = value instanceof this.bufferStructClass
            ? Reflect.get(value, this.structBufferKey) as TypedArrayInstance<Item, Instance>
            : this.typedArrayClass.from(this.structFields.map(f => Reflect.get(value, f.name)));

        const endianness = this.resolveEndianness(ctx, typedArray);

        const writeView = new Uint8Array(ctx.buffer, byteOffset, this.bytesPerData);
        writeView.set(new Uint8Array(endianness.buffer, endianness.byteOffset, endianness.byteLength));
    }
}
