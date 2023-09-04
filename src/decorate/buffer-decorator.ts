import 'reflect-metadata';
import { ContextConstant, ContextOption } from '../context/types.ts';
import { TypedArrayConstructor, TypedArrayInstance } from '../describe/typed-array.ts';
import { BufferParser, BufferParserConfig } from '../parse/buffer-parser.ts';
import { Endian } from '../utils/endianness-util.ts';
import { Constructor, getInheritedMetadata, MetadataKey, SafeAny } from '../utils/prototype-util.ts';
import { defineClassDecorator, definePropertyDecorator, getParserFields, kParserCached, kParserTarget } from './util.ts';

const kParserFields = Symbol('@@BufferParserFields') as MetadataKey<FieldConfig<SafeAny, SafeAny>[]>;

export function BufferTarget<T, Item extends (bigint | number), Instance extends TypedArrayInstance<Item, Instance>>(
    creator: TypedArrayConstructor<Item, Instance>,
    config: Partial<ContextConstant & ContextOption> = {},
) {
    function decorator<Class extends Constructor<T>>(klass: Class) {
        Reflect.defineMetadata(kParserTarget, config, klass);

        const parser = convertBufferParser(klass, creator, config.endian);

        Reflect.defineMetadata(kParserCached, parser, klass);
    }

    return defineClassDecorator(decorator as ClassDecorator);
}

type FieldConfig<T, K extends keyof T> = { name: K, };

function convertBufferParser<T extends object, Item extends (bigint | number), Instance extends TypedArrayInstance<Item, Instance>>(
    klass: Constructor<T>,
    typedArrayClass: TypedArrayConstructor<Item, Instance>,
    endian?: Endian,
): BufferParser<T, Item, Instance> {
    const targetOptions = getInheritedMetadata(kParserTarget, klass);
    if (!targetOptions.length) throw Error('The configured type has not ParserTarget');

    const fields = getParserFields<FieldConfig<T, keyof T>>(kParserFields, klass);

    const finalConfig: BufferParserConfig<T, Item, Instance> = {
        option: Object.assign({}, ...targetOptions),
        typedArrayClass: typedArrayClass,
        endian: endian,
        structClass: klass,
        structFields: fields,
    };

    return new BufferParser<T, Item, Instance>(finalConfig);
}

function ensureFieldConfig<T, K extends keyof T>(proto: object, propertyKey: K): FieldConfig<T, keyof T> {
    if (!Reflect.hasOwnMetadata(kParserFields, proto)) {
        Reflect.defineMetadata(kParserFields, [], proto);
    }

    const fields: FieldConfig<T, keyof T>[] = Reflect.getOwnMetadata(kParserFields, proto);

    const fieldIndex = fields.findIndex(field => field.name === propertyKey);

    const ensureConfig = fieldIndex > -1
        ? fields[fieldIndex]
        : { name: propertyKey } as FieldConfig<T, keyof T>;

    if (fieldIndex === -1) fields.push(ensureConfig);

    return ensureConfig;
}

export function BufferField() {
    return definePropertyDecorator(<PropertyDecorator>(function <T extends object, K extends keyof T>(proto: T, propertyKey: K) {
        ensureFieldConfig<T, K>(proto, propertyKey);
    }));
}
