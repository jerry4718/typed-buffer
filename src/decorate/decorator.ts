import 'reflect-metadata';
import { Constructor, getInheritedMetadata, getPrototypeMetadata, isExtendFrom, MetadataKey, SafeAny } from '../utils/prototype-util.ts';
import { ContextCompute, ContextOption } from '../context/types.ts';
import { StructField, StructParser, StructParserConfig } from '../parse/struct-parser.ts';
import { BaseParser } from '../context/base-parser.ts';
import { PrimitiveParser } from '../parse/primitive-parser.ts';

const kParserTarget = Symbol('@@ParserTarget') as MetadataKey<Partial<ContextOption>>;
const kParserCached = Symbol('@@ParserCached') as MetadataKey<StructParser<SafeAny>>;
// 处理递归问题
// const kParserGetter = Symbol('@@kParserGetter') as MetadataKey<() => StructParser<SafeAny>>;
const kParserFields = Symbol('@@ParserFields') as MetadataKey<FieldConfig<SafeAny, SafeAny>[]>;

export const defineClassDecorator = (decorator: ClassDecorator): ClassDecorator => decorator;
export const definePropertyDecorator = (decorator: PropertyDecorator): PropertyDecorator => decorator;
export const defineMethodDecorator = (decorator: MethodDecorator): MethodDecorator => decorator;
export const defineParameterDecorator = (decorator: ParameterDecorator): ParameterDecorator => decorator;

export function ParserTarget<T extends object>(config: Partial<ContextOption>) {
    function decorator<Class extends Constructor<T>>(klass: Class) {
        Reflect.defineMetadata(kParserTarget, config, klass);

        const parser = convertTypedParser(klass);

        Reflect.defineMetadata(kParserCached, parser, klass);
        // Reflect.defineMetadata(kParserGetter, () => parser, klass);
    }

    return defineClassDecorator(decorator as ClassDecorator);
}

type FieldConfig<K extends number | string | symbol, T> = StructField<{ [k in K]: T }, K>

export function getTypedParser<T extends object>(klass: Constructor<T>): StructParser<T> {
    return Reflect.getOwnMetadata(kParserCached, klass);
}
function convertTypedParser<T extends object>(klass: Constructor<T>): StructParser<T> {
    const targetOptions = getInheritedMetadata(klass, kParserTarget);
    if (!targetOptions.length) throw Error('The configured type has not ParserTarget');

    type LocalField = FieldConfig<keyof T, T[keyof T]>

    const symbol = kParserFields as MetadataKey<LocalField[]>;

    const fieldGroups = getPrototypeMetadata(klass, symbol);

    const composedFields: LocalField[] = [];

    for (const fieldGroup of fieldGroups) {
        for (const fieldItem of fieldGroup) {
            const fieldName = fieldItem.name;
            const composedIndex = composedFields.findIndex(composed => composed.name === fieldName);
            const composeTo = composedIndex > -1
                ? composedFields[ composedIndex ]
                : {} as LocalField;
            Object.assign(composeTo, fieldItem);
            if (composedIndex === -1) composedFields.push(composeTo);
        }
    }

    const finalConfig: StructParserConfig<T> = {
        type: klass,
        option: Object.assign({}, ...targetOptions),
        fields: composedFields,
    };
    return new StructParser<T>(finalConfig);
}

function ensureFieldConfig<K extends string | symbol, T>(proto: object, propertyKey: K): FieldConfig<K, T> {
    if (!Reflect.hasOwnMetadata(kParserFields, proto)) {
        Reflect.defineMetadata(kParserFields, [], proto);
    }

    const fields: FieldConfig<K, T>[] = Reflect.getOwnMetadata(kParserFields, proto);

    const fieldIndex = fields.findIndex(field => field.name === propertyKey);

    const ensureConfig = fieldIndex > -1
        ? fields[ fieldIndex ]
        : { name: propertyKey } as FieldConfig<K, T>;

    if (fieldIndex === -1) fields.push(ensureConfig);

    return ensureConfig;
}

function createFieldTypeDecorator<T>(parser: FieldConfig<string | symbol, T>['type']) {
    return definePropertyDecorator(function <K extends string | symbol>(proto: object, propertyKey: K) {
        const fieldConfig = ensureFieldConfig<K, T>(proto, propertyKey);
        Object.assign(fieldConfig, { type: parser });
    });
}

export function FieldType<T>(input: PrimitiveParser<T>): PropertyDecorator
export function FieldType<T>(input: ContextCompute<BaseParser<T> | { new(): T }>): PropertyDecorator
export function FieldType<T, O>(input: { new(option: O): BaseParser<T> }, option: O): PropertyDecorator
export function FieldType<T>(input: { new(): T }): PropertyDecorator
export function FieldType<T, O>(input: SafeAny, config?: O): PropertyDecorator {
    // 原始数据类型的Parser实例
    if (input instanceof PrimitiveParser) {
        return createFieldTypeDecorator(input);
    }
    // BaseParser类型的子类class
    if (isExtendFrom(input, BaseParser as Constructor<BaseParser<T>>)) {
        return createFieldTypeDecorator(Reflect.construct(input, [ config ]));
    }
    // 已经标记了ParserTarget的class
    // + 如果存在循环依赖，这里判断不到，所以在下面部分，将type指定为动态
    if (Reflect.hasOwnMetadata(kParserCached, input)) {
        return createFieldTypeDecorator(Reflect.getOwnMetadata(kParserCached, input));
    }

    // 此时input签名应该是ContextCompute<BaseParser<T> | { new(): T }>

    return createFieldTypeDecorator((context, scope) => {
        // 处理循环依赖(如果存在循环依赖，这里应该已经加载完毕)
        if (Reflect.hasOwnMetadata(kParserCached, input)) {
            return Reflect.getOwnMetadata(kParserCached, input);
        }
        // 确保ContextCompute可以正常执行，
        const parser = input(context, scope);

        // 这里执行结果也可能是装饰器处理过的class，所以再进行一次判断
        if (Reflect.hasOwnMetadata(kParserCached, parser)) {
            return Reflect.getOwnMetadata(kParserCached, parser);
        }

        return parser;
    });
}

export function FieldOption<T>(option: Partial<ContextOption>) {
    return definePropertyDecorator(function <K extends string | symbol>(proto: object, propertyKey: K) {
        const fieldConfig = ensureFieldConfig<K, T>(proto, propertyKey);
        Object.assign(fieldConfig, { option });
    });
}

export function FieldCondition<T>(condition: ContextCompute<boolean>, defaultValue?: T) {
    return definePropertyDecorator(function <K extends string | symbol>(proto: object, propertyKey: K) {
        const fieldConfig = ensureFieldConfig<K, T>(proto, propertyKey);
        Object.assign(fieldConfig, { condition: { if: condition, default: defaultValue } });
    });
}

export function FieldExpose<T>(expose: boolean | string | symbol = true) {
    return definePropertyDecorator(function <K extends string | symbol>(proto: object, propertyKey: K) {
        const fieldConfig = ensureFieldConfig<K, T>(proto, propertyKey);
        Object.assign(fieldConfig, { expose });
    });
}
