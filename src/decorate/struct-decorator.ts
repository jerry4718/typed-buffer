import 'reflect-metadata';
import { AdvancedParser, BaseParser, isParserClass, isParserCreator } from '../context/base-parser.ts';
import { ContextCompute, ContextConstant, ContextOption } from '../context/types.ts';
import { PrimitiveParser } from '../parse/primitive-parser.ts';
import { StructFieldActual, StructParser, StructParserConfig } from '../parse/struct-parser.ts';
import { Constructor, getInheritedMetadata, MetadataKey, SafeAny } from '../utils/prototype-util.ts';
import { defineClassDecorator, definePropertyDecorator, getParserFields, kParserCached, kParserTarget } from './util.ts';

const kParserFields = Symbol('@@StructParserFields') as MetadataKey<FieldConfig<SafeAny, SafeAny>[]>;

export function StructTarget<T extends object>(config: Partial<ContextConstant & ContextOption> = {}) {
    function decorator<Class extends Constructor<T>>(klass: Class) {
        Reflect.defineMetadata(kParserTarget, config, klass);

        const parser = convertTypedParser(klass);

        Reflect.defineMetadata(kParserCached, parser, klass);
    }

    return defineClassDecorator(decorator as ClassDecorator);
}

type FieldConfig<K extends number | string | symbol, T> = StructFieldActual<{ [k in K]: T }, K>

export function getTypedParser<T extends object>(klass: Constructor<T>): StructParser<T> {
    return Reflect.getOwnMetadata(kParserCached, klass);
}

function convertTypedParser<T extends object>(klass: Constructor<T>): StructParser<T> {
    const targetOptions = getInheritedMetadata(kParserTarget, klass);
    if (!targetOptions.length) throw Error('The configured type has not ParserTarget');

    const fields = getParserFields<FieldConfig<keyof T, T[keyof T]>>(kParserFields, klass);

    const finalConfig: StructParserConfig<T> = {
        option: Object.assign({}, ...targetOptions),
        type: klass,
        fields: fields,
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
        ? fields[fieldIndex]
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

export function FieldType<T>(parser: PrimitiveParser<T>): PropertyDecorator
export function FieldType<T, O>(parserCreator: ((option: O) => AdvancedParser<T>) | (new(option: O) => AdvancedParser<T>), config: O): PropertyDecorator
export function FieldType<T>(typeClass: new() => T): PropertyDecorator
export function FieldType(parserSwitch: ContextCompute<BaseParser<SafeAny> | (new () => SafeAny)>): PropertyDecorator
export function FieldType<T, O>(input: SafeAny, config?: O): PropertyDecorator {
    // 原始数据类型的Parser实例
    if (input instanceof PrimitiveParser) {
        return createFieldTypeDecorator<T>(input);
    }
    // createParserCreator创建而来的creator
    if (isParserCreator(input)) {
        return createFieldTypeDecorator(input(config));
    }
    // BaseParser类型的子类class
    if (isParserClass(input)) {
        return createFieldTypeDecorator(Reflect.construct(input, [ config ]));
    }
    // 已经标记了ParserTarget的class
    // + 如果存在循环引用，这里会无法正确判断，所以在下面部分，将type指定为动态
    if (Reflect.hasOwnMetadata(kParserCached, input)) {
        return createFieldTypeDecorator<T>(Reflect.getOwnMetadata(kParserCached, input));
    }

    // 此时input签名应该是ContextCompute<BaseParser<T> | { new(): T }>或者循环引用
    return createFieldTypeDecorator<T>((context, scope) => {
        // 处理循环依赖(如果存在循环依赖，这里应该已经加载完毕)
        if (Reflect.hasOwnMetadata(kParserCached, input)) {
            return Reflect.getOwnMetadata(kParserCached, input);
        }
        // 确保parserSwitch可以正常执行，
        const parser = input(context, scope);

        // 这里执行结果也可能是装饰器处理过的class，所以再对parser进行一次判断
        if (Reflect.hasOwnMetadata(kParserCached, parser)) {
            return Reflect.getOwnMetadata(kParserCached, parser);
        }

        return parser;
    });
}

export function FieldPoint<T>(point: number | ContextCompute<number>) {
    return definePropertyDecorator(function <K extends string | symbol>(proto: object, propertyKey: K) {
        const fieldConfig = ensureFieldConfig<K, T>(proto, propertyKey);
        Object.assign(fieldConfig, { point });
    });
}

export function FieldIf<T>(condition: boolean | ContextCompute<boolean>, defaultValue?: T | ContextCompute<T>) {
    return definePropertyDecorator(function <K extends string | symbol>(proto: object, propertyKey: K) {
        const fieldConfig = ensureFieldConfig<K, T>(proto, propertyKey);
        Object.assign(fieldConfig, { if: condition, default: defaultValue });
    });
}

export function FieldExpose<T>(expose: boolean | string | symbol = true) {
    return definePropertyDecorator(function <K extends string | symbol>(proto: object, propertyKey: K) {
        const fieldConfig = ensureFieldConfig<K, T>(proto, propertyKey);
        Object.assign(fieldConfig, { expose });
    });
}

export function FieldSetup<T>(name: string, value: SafeAny | ContextCompute<SafeAny>) {
    return definePropertyDecorator(function <K extends string | symbol>(proto: object, propertyKey: K) {
        const fieldConfig = ensureFieldConfig<K, T>(proto, propertyKey);
        Object.assign(fieldConfig, { setup: [ ...(fieldConfig.setup || []), { name, value } ] });
    });
}

export function FieldResolve<T>(resolve: T | ContextCompute<T>) {
    return definePropertyDecorator(function <K extends string | symbol>(proto: object, propertyKey: K) {
        const fieldConfig = ensureFieldConfig<K, T>(proto, propertyKey);
        Object.assign(fieldConfig, { resolve });
    });
}
