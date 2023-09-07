import { BaseParser } from '../context/base-parser.ts';
import { AccessOption } from '../context/types.ts';
import { Constructor, getPrototypeMetadata, MetadataKey, SafeAny } from '../utils/prototype-util.ts';

export const kParserTarget = Symbol('@@ParserTarget') as MetadataKey<Partial<AccessOption>>;
export const kParserCached = Symbol('@@ParserCached') as MetadataKey<BaseParser<SafeAny>>;

export const defineClassDecorator = (decorator: ClassDecorator): ClassDecorator => decorator;
export const definePropertyDecorator = (decorator: PropertyDecorator): PropertyDecorator => decorator;
export const defineMethodDecorator = (decorator: MethodDecorator): MethodDecorator => decorator;
export const defineParameterDecorator = (decorator: ParameterDecorator): ParameterDecorator => decorator;

export function getTargetParser<T extends object>(klass: Constructor<T>): BaseParser<T> {
    return Reflect.getOwnMetadata(kParserCached, klass);
}

export function getParserFields<T extends { name: SafeAny }>(kParserFields: MetadataKey<T[]>, klass: Constructor<SafeAny>) {
    const fieldGroups = getPrototypeMetadata(kParserFields, klass);

    const fieldComposed: T[] = [];

    for (const fieldGroup of fieldGroups) {
        for (const fieldItem of fieldGroup) {
            const fieldName = fieldItem.name;
            const composedIndex = fieldComposed.findIndex(composed => composed.name === fieldName);
            const composeTo = composedIndex > -1
                ? fieldComposed[composedIndex]
                : {} as T;
            Object.assign(composeTo, fieldItem);
            if (composedIndex === -1) fieldComposed.push(composeTo);
        }
    }

    return fieldComposed;
}

export function ensureFieldConfig<T extends { name: SafeAny }>(kParserFields: MetadataKey<T[]>, proto: object, propertyKey: SafeAny): T {
    if (!Reflect.hasOwnMetadata(kParserFields, proto)) {
        Reflect.defineMetadata(kParserFields, [], proto);
    }

    const fields: T[] = Reflect.getOwnMetadata(kParserFields, proto);

    const fieldIndex = fields.findIndex(field => field.name === propertyKey);

    const ensureConfig = fieldIndex > -1
        ? fields[fieldIndex]
        : { name: propertyKey } as T;

    if (fieldIndex === -1) fields.push(ensureConfig);

    return ensureConfig;
}
