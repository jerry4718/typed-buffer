import 'reflect-metadata';
import { Encoding, Encodings } from '@/utils/encoding';
import { slice } from '@/utils/proto-fn';
import { assertType, isFunction, isNumber, isObject } from '@/utils/type-util';

type PrimitiveReader<T> = (this: DataView, byteOffset: number, littleEndian?: boolean) => T
type PrimitiveWriter<T> = (this: DataView, byteOffset: number, value: T, littleEndian?: boolean) => void

type Endian = 'le' | 'be'

interface ParserOptionComposable {
    endian?: Endian,
}

interface PrimitiveParserOptionRequired<T extends number | bigint> {
    byteSize: number,
    reader: PrimitiveReader<T>,
    writer: PrimitiveWriter<T>,
}

type PrimitiveParserOption<T> = ParserOptionComposable & PrimitiveParserOptionRequired<T>;

interface ValueSpec<T> {
    byteSize: number,
    value: T,
    position: [ number, number ]
}

interface BaseParser<T> {
    read(view: DataView, byteOffset: number, option?: ParserOptionComposable): ValueSpec<T>,

    write(view: DataView, byteOffset: number, value: T, option?: ParserOptionComposable): ValueSpec<T>,
}

const keyPrimitiveOption = Symbol('@@primitiveOption');
const keyAdvancedCreator = Symbol('@@advancedCreator');

interface PrimitiveParser<T> extends BaseParser<T> {
    [keyPrimitiveOption]: PrimitiveParserOption<T>;
}

interface AdvancedParser<T> extends BaseParser<T> {
    [keyAdvancedCreator]: <T>(...args: any) => AdvancedParser<T>;
}

type ArrayItem<T> = T extends ArrayLike<infer P> ? P : never

function isLittleEndian(endian: Endian): boolean {
    return endian === 'le';
}

function valueSpec<T>(value: T, byteOffset: number, byteSize: number): ValueSpec<T> {
    return { value, byteSize, position: [ byteOffset, byteOffset + byteSize ] };
}

function definePrimitiveParser<T>(defineOption: PrimitiveParserOption<T>): PrimitiveParser<T> {
    const { reader, writer, byteSize, endian } = defineOption;

    return Object.freeze({
        [keyPrimitiveOption]: Object.freeze(defineOption),
        read(view: DataView, byteOffset: number, option?: ParserOptionComposable): ValueSpec<T> {
            const littleEndian = isLittleEndian(option.endian || endian);
            const value: T = reader.call(view, byteOffset, littleEndian);
            return valueSpec(value, byteOffset, byteSize);
        },
        write(view: DataView, byteOffset: number, value: T, option?: ParserOptionComposable): ValueSpec<T> {
            const littleEndian = isLittleEndian(option.endian || endian);
            writer.call(view, byteOffset, value, littleEndian);
            return valueSpec(value, byteOffset, byteSize);
        },
    });
}

function compose<T>(base: PrimitiveParserOptionRequired<T>, ...expand: Partial<ParserOptionComposable>[]) {
    return Object.freeze(Object.assign.apply(void 0, [ {}, base, ...expand ])) as PrimitiveParserOption<T>;
}

const {
    getInt8, setInt8, getUint8, setUint8,
    getInt16, setInt16, getUint16, setUint16,
    getInt32, setInt32, getUint32, setUint32,
    getFloat32, setFloat32, getFloat64, setFloat64,
    getBigInt64, setBigInt64, getBigUint64, setBigUint64,
} = DataView.prototype;

const cLE: Pick<ParserOptionComposable, 'endian'> = { endian: 'le' };
const cBE: Pick<ParserOptionComposable, 'endian'> = { endian: 'be' };

function cell<T>(
    byteSize: number,
    reader: PrimitiveReader<T>,
    writer: PrimitiveWriter<T>,
): PrimitiveParserOptionRequired<T> {
    return { byteSize, reader, writer };
}

const cInt8 = cell(1, getInt8, setInt8);
const cUInt8 = cell(1, getUint8, setUint8);
const cInt16 = cell(2, getInt16, setInt16);
const cUInt16 = cell(2, getUint16, setUint16);
const cInt32 = cell(4, getInt32, setInt32);
const cUInt32 = cell(4, getUint32, setUint32);
const cInt64 = cell(8, getBigInt64, setBigInt64);
const cUInt64 = cell(8, getBigUint64, setBigUint64);
const cFloat32 = cell(4, getFloat32, setFloat32);
const cFloat64 = cell(8, getFloat64, setFloat64);

const Int8 = definePrimitiveParser(compose(cInt8));
const UInt8 = definePrimitiveParser(compose(cUInt8));
const Int16 = definePrimitiveParser(compose(cInt16));
const UInt16 = definePrimitiveParser(compose(cUInt16));
const Int32 = definePrimitiveParser(compose(cInt32));
const UInt32 = definePrimitiveParser(compose(cUInt32));
const Int64 = definePrimitiveParser(compose(cInt64));
const UInt64 = definePrimitiveParser(compose(cUInt64));
const Float32 = definePrimitiveParser(compose(cFloat32));
const Float64 = definePrimitiveParser(compose(cFloat64));

const Int8BE = definePrimitiveParser(compose(cInt8, cBE));
const UInt8BE = definePrimitiveParser(compose(cUInt8, cBE));
const Int16BE = definePrimitiveParser(compose(cInt16, cBE));
const UInt16BE = definePrimitiveParser(compose(cUInt16, cBE));
const Int32BE = definePrimitiveParser(compose(cInt32, cBE));
const UInt32BE = definePrimitiveParser(compose(cUInt32, cBE));
const Int64BE = definePrimitiveParser(compose(cInt64, cBE));
const UInt64BE = definePrimitiveParser(compose(cUInt64, cBE));
const Float32BE = definePrimitiveParser(compose(cFloat32, cBE));
const Float64BE = definePrimitiveParser(compose(cFloat64, cBE));

const Int8LE = definePrimitiveParser(compose(cInt8, cLE));
const UInt8LE = definePrimitiveParser(compose(cUInt8, cLE));
const Int16LE = definePrimitiveParser(compose(cInt16, cLE));
const UInt16LE = definePrimitiveParser(compose(cUInt16, cLE));
const Int32LE = definePrimitiveParser(compose(cInt32, cLE));
const UInt32LE = definePrimitiveParser(compose(cUInt32, cLE));
const Int64LE = definePrimitiveParser(compose(cInt64, cLE));
const UInt64LE = definePrimitiveParser(compose(cUInt64, cLE));
const Float32LE = definePrimitiveParser(compose(cFloat32, cLE));
const Float64LE = definePrimitiveParser(compose(cFloat64, cLE));

type ParserContext<T, Parent = any, Root = any> = {
    view: DataView,
    section?: Partial<T>,
    parent?: Parent,
    root?: Root,
}

interface Encoding {
    encode: (str: string) => Uint8Array,
    decode: (bytes: Uint8Array) => string,
}

type NumberOption<T> = number | PrimitiveParser<PrimitiveType.Number> | ((ctx: ParserContext<T>) => number)

// 字符串解析器
type ArrayParserOption<T> = {
    item: ParserSelect<T>,
    count?: NumberOption<T>,
    size?: NumberOption<T>,
    end?: number | ((ctx: ParserContext<string>) => number), // 支持：1.指定结束于固定数字或者 2.根据下一个unit8判断
}

function isUndefined(value: any): value is undefined {
    return typeof value !== 'undefined';
}

function hackItemType<I, O>(input: I): O {
    return input as unknown as O;
}

function getArrayParser<T>(parserOption: ArrayParserOption<T>): AdvancedParser<T> {
    const { item: itemParser, count, size, end } = parserOption;
    if (isUndefined(itemParser)) {
        throw new Error('Invalid parser options. Option [item] is required.');
    }
    if (Number(!isUndefined(count)) + Number(!isUndefined(size)) + Number(!isUndefined(end)) !== 1) {
        throw new Error('Invalid parser options. Only one of [size] or [end].');
    }

    function readOptionNumber(option: NumberOption<T>, view: DataView, byteOffset: number): ValueSpec<number> {
        if (isObject(option) && option[keyPrimitiveOption] && assertType<PrimitiveParser<PrimitiveType.Number>>(option)) {
            return option.read(view, byteOffset);
        }
        if (typeof option === 'function' || typeof option === 'number') {
            const value = typeof option === 'number' ? option : option({});
            return valueSpec(value, byteOffset, 0);
        }
        throw Error('one of NumberOption is not valid');
    }

    function writeOptionNumber(option: NumberOption<T>, view: DataView, byteOffset: number, value: number): ValueSpec<number> {
        if (isObject(option) && option[keyPrimitiveOption] && assertType<PrimitiveParser<PrimitiveType.Number>>(option)) {
            return option.write(view, byteOffset, value);
        }
        if (typeof option === 'function' || typeof option === 'number') {
            // const value = typeof size === 'number' ? size : size({});
            return valueSpec(value, byteOffset, 0);
        }
        throw Error('one of NumberOption is not valid');
    }

    function endJudge(view: DataView, dataOffset: number): boolean {
        const { value: nextUInt8 } = UInt8.read(view, dataOffset);
        if (isNumber(end)) return nextUInt8 === end;
        return nextUInt8 === end({});
    }

    function endMark(view: DataView, dataOffset: number): ValueSpec<number> {
        const value = isFunction(end) ? end({}) : end;
        return UInt8.write(view, dataOffset, value);
    }

    function wrapReturn(itemSpecs: ValueSpec<ParserValue<T>>[], byteOffset: number, addSize: number): ValueSpec<ArrayTypeSelect<T>> {
        const items = itemSpecs.map(itemSpec => itemSpec.value);
        const itemsSize = itemSpecs.map(itemSpec => itemSpec.byteSize).reduce((a, b) => a + b);
        const byteSize = itemsSize + addSize;
        if (Object.hasOwn(itemParser, keyPrimitiveOption)) {
            const ItemArray = itemParser[keyPrimitiveOption].Array;
            return valueSpec(ItemArray.from(items, hackItemType), byteOffset, byteSize);
        }
        return valueSpec(items, byteOffset, byteSize);
    }

    return {
        [keyAdvancedCreator]: getArrayParser,
        read(view: DataView, byteOffset: number, option?: ParserOptionComposable): ValueSpec<ArrayTypeSelect<T>> {
            if (!isUndefined(count)) {
                // 使用传入的 count 选项获取字符串长度
                const {
                    value: countValue,
                    byteSize: countByteSize,
                    position: [ _, countEndOffset ],
                } = readOptionNumber(count, view, byteOffset);
                const itemSpecs: ValueSpec<ParserValue<T>>[] = [];
                let itemsByteSize = 0;
                for (let readIndex = 0; readIndex < countValue; readIndex++) {
                    const itemSpec = itemParser.read(view, countEndOffset + itemsByteSize, option);
                    itemSpecs.push(itemSpec);
                    itemsByteSize += itemSpec.byteSize;
                }
                return wrapReturn(itemSpecs, byteOffset, countByteSize);
            }

            if (!isUndefined(size)) {
                // 使用传入的 size 选项获取字符串长度
                const {
                    value: sizeValue,
                    byteSize: sizeByteSize,
                    position: [ _, sizeEndOffset ],
                } = readOptionNumber(size, view, byteOffset);

                const itemSpecs: ValueSpec<T>[] = [];
                let itemsByteSize = 0;
                while (itemsByteSize < sizeValue) {
                    const itemSpec = itemParser.read(view, sizeEndOffset + itemsByteSize, option);
                    itemSpecs.push(itemSpec);
                    itemsByteSize += itemSpec.byteSize;
                }

                if (itemsByteSize > sizeValue) {
                    throw Error('Invalid array data read');
                }

                return wrapReturn(itemSpecs, byteOffset, sizeByteSize);
            }

            if (!isUndefined(end)) {
                const itemSpecs: ValueSpec<T>[] = [];
                let itemsByteSize = 0;
                // 使用 endJudge 来确定读取Array的长度
                while (endJudge(view, byteOffset + itemsByteSize)) {
                    const itemSpec = itemParser.read(view, byteOffset + itemsByteSize, option);
                    itemSpecs.push(itemSpec);
                    itemsByteSize += itemSpec.byteSize;
                }

                // 这里表示将end标志位也算入Array数据长度
                const endSize = 1;
                return wrapReturn(itemSpecs, byteOffset, endSize);
            }

            // 如果没有提供 count,size或end，则抛出错误，因为无法确定Array的长度
            throw new Error('Either count,size or end must be provided to read the array.');
        },
        write(view: DataView, byteOffset: number, value: ArrayTypeSelect<T>, option?: ParserOptionComposable): ValueSpec<ArrayTypeSelect<T>> {
            if (!isUndefined(count)) {
                // 使用传入的 count 选项写入字符串长度
                const {
                    byteSize: countByteSize,
                    position: [ _, countEndOffset ],
                } = writeOptionNumber(count, view, byteOffset, value.length);
                const itemSpecs: ValueSpec<T>[] = [];
                let itemsByteSize = 0;
                for (const item of value) {
                    const itemSpec = itemParser.write(view, countEndOffset + itemsByteSize, item, option);
                    itemSpecs.push(itemSpec);
                    itemsByteSize += itemSpec.byteSize;
                }
                return wrapReturn(itemSpecs, byteOffset, countByteSize);
            }

            if (!isUndefined(size)) {
                // 使用传入的 size 选项写入字符串长度（暂时未知具体长度，先写0，以获取offset）
                const {
                    byteSize: sizeByteSize,
                    position: [ _, sizeEndOffset ],
                } = writeOptionNumber(size, view, byteOffset, 0);

                const itemSpecs: ValueSpec<T>[] = [];
                let itemsByteSize = 0;
                for (const item of value) {
                    const itemSpec = itemParser.write(view, sizeEndOffset + itemsByteSize, item, option);
                    itemSpecs.push(itemSpec);
                    itemsByteSize += itemSpec.byteSize;
                }

                // 回到初始位置，写入正确的size
                writeOptionNumber(size, view, byteOffset, itemsByteSize);

                return wrapReturn(itemSpecs, byteOffset, sizeByteSize);
            }

            if (!isUndefined(end)) {
                const itemSpecs: ValueSpec<T>[] = [];
                let itemsByteSize = 0;
                for (const item of value) {
                    const itemSpec = itemParser.write(view, byteOffset + itemsByteSize, item, option);
                    itemSpecs.push(itemSpec);
                    itemsByteSize += itemSpec.byteSize;
                }

                endMark(view, byteOffset + itemsByteSize);

                // 这里表示将end标志位也算入Array数据长度
                const endSize = 1;
                return wrapReturn(itemSpecs, byteOffset, endSize);
            }
            // 如果没有提供 count,size或end，则抛出错误，因为无法确定Array的长度
            throw new Error('Either count,size or end must be provided to write the array.');
        },
    };
}

// 字符串解析器
type StringParserOption =
    & Pick<ArrayParserOption<number>, 'end' | 'size'>
    & { encoding?: Encoding }

function getStringParser(parserOption: StringParserOption): AdvancedParser<string> {
    const { encoding = Encodings.Ascii, size, end } = parserOption;
    if (Number(!isUndefined(size)) + Number(!isUndefined(end)) !== 1) {
        throw new Error('Invalid parser options. Only one of size or end.');
    }

    const Uint8ArrayParser = getArrayParser({ item: UInt8, size, end });

    return {
        [keyAdvancedCreator]: getStringParser,
        read(view: DataView, byteOffset: number, option?: ParserOptionComposable): ValueSpec<string> {
            const { value: readArray, byteSize } = Uint8ArrayParser.read(view, byteOffset, option);
            const byteArray = readArray instanceof Uint8Array ? readArray : Uint8Array.from(readArray);
            const value = encoding.decode(byteArray);
            return valueSpec(value, byteOffset, byteSize);
        },
        write(view: DataView, byteOffset: number, value: string, option?: ParserOptionComposable): ValueSpec<string> {
            const byteArray = encoding.encode(value);
            const { byteSize } = Uint8ArrayParser.write(view, byteOffset, slice.call(byteArray), option);
            return valueSpec(value, byteOffset, byteSize);
        },
    };
}

type ObjectFieldOne<T, K extends keyof T> = {
    name: K,
    type: BaseParser<T[K]>
}

type ObjectField<T> = { [K in keyof T]: ObjectFieldOne<T, K> }[keyof T]

type ObjectParserOption<T> = { fields: ObjectField<T>[] }

function getStructParser<T>(parserOption: ObjectParserOption<T>): AdvancedParser<T> {
    const { fields } = parserOption;

    return {
        [keyAdvancedCreator]: getStructParser,
        read(view: DataView, byteOffset: number, option?: ParserOptionComposable): ValueSpec<T> {
            const result = {} as Partial<T>;
            let currentOffset = byteOffset;

            const fieldSpecs: ValueSpec<T[keyof T]>[] = [];
            let fieldsByteSize = 0;
            for (const fieldConfig of fields) {
                if (!assertType<ObjectField<T>>(fieldConfig)) continue;
                const { name: fieldName, type: fieldParser } = fieldConfig;

                const fieldSpec = fieldParser.read(view, byteOffset + fieldsByteSize, option);
                fieldSpecs.push(fieldSpec);
                fieldsByteSize += fieldSpec.byteSize;
            }

            return valueSpec(result, byteOffset, currentOffset - byteOffset);
        },
        write(view: DataView, byteOffset: number, value: T, option?: ParserOptionComposable): ValueSpec<T> {
            let currentOffset = byteOffset;

            for (const field of fields) {
                const { name, type } = field;
                const fieldValue = value[name];
                const { byteSize } = type.write(view, currentOffset, fieldValue, option);
                currentOffset += byteSize;
            }

            return valueSpec(value, byteOffset, currentOffset - byteOffset);
        },
    };
}

type ParserFieldMetadata = {
    name: string | symbol;
    type: AdvancedParser<any> | PrimitiveParser<any>;
};

type ParserClassMetadata = {
    fields: ParserFieldMetadata[];
};

const keyParserFieldMetadata = Symbol('@@parser-field-metadata');
const keyParserClassMetadata = Symbol('@@parser-class-metadata');

function ParserField<T>(type: AdvancedParser<T> | PrimitiveParser<T>): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const fields: ParserFieldMetadata[] = Reflect.getMetadata(keyParserFieldMetadata, target) || [];
        fields.push({ name: propertyKey.toString(), type });
        Reflect.defineMetadata(keyParserFieldMetadata, fields, target);
    };
}

function ParserClass(): ClassDecorator {
    return (constructor: Function) => {
        const fields: ParserFieldMetadata[] = Reflect.getMetadata(keyParserFieldMetadata, constructor.prototype) || [];
        const metadata: ParserClassMetadata = { fields };
        Reflect.defineMetadata(keyParserClassMetadata, metadata, constructor.prototype);
    };
}

function getTypedParser<T>(targetClass: new () => T): AdvancedParser<T> {
    const metadata: ParserClassMetadata = Reflect.getMetadata(keyParserClassMetadata, targetClass.prototype);
    if (!metadata || !metadata.fields || metadata.fields.length === 0) {
        throw new Error(`No valid metadata found for class ${targetClass.name}. Make sure to use the @ParserClass and @ParserField decorators.`);
    }

    const fields = metadata.fields as ObjectParserOption<T>['fields'];
    const objectParser = getStructParser<T>({ fields });

    return {
        [keyAdvancedCreator]: getTypedParser,
        read(view: DataView, byteOffset: number, option?: ParserOptionComposable): ValueSpec<T> {
            const { value: structValue, byteSize } = objectParser.read(view, byteOffset, option);
            const result = Reflect.construct(targetClass, []);
            return valueSpec(Object.assign(result, structValue), byteOffset, byteSize);
        },
        write(view: DataView, byteOffset: number, value: T, option?: ParserOptionComposable): ValueSpec<T> {
            const { byteSize } = objectParser.write(view, byteOffset, value, option);
            return valueSpec(value, byteOffset, byteSize);
        },
    };
}

@ParserClass()
class Person {
    @ParserField(getStringParser({ encoding: Encodings.Ascii, end: 0 }))
    name!: string;

    @ParserField(Int32LE)
    age!: number;
}

const personData = new Uint8Array(14); // Assuming the buffer size for name + age is 14 bytes
const person: Person = { name: 'John Doe', age: 30 };

const personParser = getTypedParser(Person);
const { value: parsedPerson, byteSize } = personParser.write(new DataView(personData.buffer), 0, person);

console.log(parsedPerson); // Output: { name: 'John Doe', age: 30 }
console.log(byteSize); // Output: 14
