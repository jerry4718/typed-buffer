import 'reflect-metadata';
import { ContextConstant, ContextOption } from '../context/types.ts';
import { TypedArrayConstructor, TypedArrayInstance } from '../describe/typed-array.ts';
import { BufferParser, BufferParserConfig } from '../parse/buffer-parser.ts';
import { Endian } from '../utils/endianness-util.ts';
import { Constructor, getInheritedMetadata, MetadataKey, SafeAny } from '../utils/prototype-util.ts';
import { defineClassDecorator, definePropertyDecorator, ensureFieldConfig, getParserFields, kParserCached, kParserTarget } from './util.ts';

const kParserFields = Symbol('@@BufferParserFields') as MetadataKey<FieldConfig<SafeAny, SafeAny>[]>;

export function BufferTarget<T, Item extends (bigint | number), Instance extends TypedArrayInstance<Item, Instance>>(
    typedArrayClass: TypedArrayConstructor<Item, Instance>,
    config: Partial<ContextConstant & ContextOption> = {},
) {
    function decorator<Class extends Constructor<T>>(klass: Class) {
        Reflect.defineMetadata(kParserTarget, config, klass);

        const parser = convertBufferParser(klass, typedArrayClass, config.endian);

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

export function BufferField() {
    return definePropertyDecorator(<PropertyDecorator>(function <T extends object, K extends keyof T>(proto: T, propertyKey: K) {
        ensureFieldConfig<FieldConfig<T, keyof T>>(kParserFields, proto, propertyKey);
    }));
}
