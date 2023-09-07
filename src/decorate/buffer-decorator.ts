import 'reflect-metadata';
import { ContextConstant, ContextOption } from '../context/types.ts';
import { TypedArrayInstance } from '../utils/typed-array.ts';
import { BufferParser, BufferParserConfig } from '../parse/buffer-parser.ts';
import { Endian } from '../utils/endianness-util.ts';
import { Constructor, getInheritedMetadata, MetadataKey, SafeAny } from '../utils/prototype-util.ts';
import { defineClassDecorator, definePropertyDecorator, ensureFieldConfig, getParserFields, kParserCached, kParserTarget } from './basic-util.ts';
import { PrimitiveParser } from "../parse/primitive-parser.ts";

const kParserFields = Symbol('@@BufferParserFields') as MetadataKey<FieldConfig<SafeAny, SafeAny>[]>;

export function BufferTarget<T, Item extends (bigint | number), Container extends TypedArrayInstance<Item, Container>>(
    field: PrimitiveParser<Item, Container>,
    config: Partial<ContextConstant & ContextOption> = {},
) {
    function decorator<Class extends Constructor<T>>(klass: Class) {
        Reflect.defineMetadata(kParserTarget, config, klass);

        const parser = convertBufferParser(klass, field, config.endian);

        Reflect.defineMetadata(kParserCached, parser, klass);
    }

    return defineClassDecorator(decorator as ClassDecorator);
}

type FieldConfig<T, K extends keyof T> = { name: K, };

function convertBufferParser<T extends object, Item extends (bigint | number), Container extends TypedArrayInstance<Item, Container>>(
    klass: Constructor<T>,
    field: PrimitiveParser<Item, Container>,
    endian?: Endian,
): BufferParser<T, Item, Container> {
    const targetOptions = getInheritedMetadata(kParserTarget, klass);
    if (!targetOptions.length) throw Error('The configured type has not ParserTarget');

    const fields = getParserFields<FieldConfig<T, keyof T>>(kParserFields, klass);

    const finalConfig: BufferParserConfig<T, Item, Container> = {
        // option: Object.assign({}, ...targetOptions),
        field: field,
        endian: endian,
        structClass: klass,
        structFields: fields,
    };

    return new BufferParser<T, Item, Container>(finalConfig);
}

export function BufferField() {
    return definePropertyDecorator(<PropertyDecorator>(function <T extends object, K extends keyof T>(proto: T, propertyKey: K) {
        ensureFieldConfig<FieldConfig<T, keyof T>>(kParserFields, proto, propertyKey);
    }));
}
