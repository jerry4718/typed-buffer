import { AdvancedParser, BaseParser, BaseParserConfig, createParserCreator } from '../context/base-parser.ts';
import { ContextCompute, ContextOption, ParserContext } from '../context/types.ts';
import { isBoolean, isFunction, isNumber, isUndefined } from '../utils/type-util.ts';
import { ValueSnap } from '../context/parser-context.ts';

export type StructField<T, K extends keyof T> = {
    name: K,
    type: BaseParser<T[K]> | ContextCompute<BaseParser<T[K]> | undefined>,
    point?: number | ContextCompute<number>,
    option?: ContextOption,
    if?: boolean | ContextCompute<boolean>,
    default?: T[K] | ContextCompute<T[K]>,
    expose?: boolean | string | symbol,
};

export type StructParserConfig<T> =
    & BaseParserConfig
    & { type?: new () => T }
    & { fields: StructField<T, keyof T>[] }

export const kStructReadSnap = Symbol.for('@@StructReadSnap');
export const kStructReadKeys = Symbol.for('@@StructReadKeys');
export const kStructWriteSnap = Symbol.for('@@StructWriteSnap');
export const kStructWriteKeys = Symbol.for('@@StructWriteKeys');

export type StructSnap<T extends object> = { [K in keyof T]: ValueSnap<T[K]> };

export function getStructReadSnap<T extends object>(target: T): StructSnap<T> | undefined {
    const structReadKeys: (keyof T)[] = Reflect.getOwnMetadata(kStructReadKeys, target);
    if (!structReadKeys) return undefined;
    const structSnap = {} as StructSnap<T>;
    for (const structReadKey of structReadKeys) {
        Reflect.set(
            structSnap,
            structReadKey,
            Reflect.getOwnMetadata(kStructReadSnap, target, structReadKey as string),
        );
    }
    return structSnap;
}

export function getStructWriteSnap<T extends object>(target: T): StructSnap<T> | undefined {
    const structWriteKeys: (keyof T)[] = Reflect.getOwnMetadata(kStructWriteKeys, target);
    if (!structWriteKeys) return undefined;
    const structSnap = {} as StructSnap<T>;
    for (const structWriteKey of structWriteKeys) {
        Reflect.set(
            structSnap,
            structWriteKey,
            Reflect.getOwnMetadata(kStructWriteSnap, target, structWriteKey as string),
        );
    }
    return structSnap;
}

export class StructParser<T extends object> extends AdvancedParser<T> {
    private readonly fields: StructField<T, keyof T>[];
    private readonly creator: new () => T;

    constructor(config: StructParserConfig<T>) {
        super(config);
        this.fields = config.fields;
        this.creator = config.type || Object as unknown as new () => T;
    }

    resolveParser<T, K extends keyof T>(ctx: ParserContext, type: BaseParser<T[K]> | ContextCompute<BaseParser<T[K]> | undefined>): BaseParser<T[K]> {
        if (type instanceof BaseParser) return type;
        const resolved = ctx.compute(type);
        if (resolved instanceof BaseParser) return resolved;
        throw Error('Cannot resolve that type as any Parser');
    }

    resolveOption(ctx: ParserContext, fieldConfig: StructField<T, keyof T>): ContextOption {
        const composeOptions: Partial<ContextOption>[] = [];
        const inputOption = fieldConfig.option;
        const inputPoint = fieldConfig.point;

        if (!isUndefined(inputOption)) composeOptions.push(inputOption);
        if (!isUndefined(inputPoint) && isNumber(inputPoint)) composeOptions.push({ point: inputPoint });
        if (!isUndefined(inputPoint) && isFunction(inputPoint)) composeOptions.push({ point: ctx.compute(inputPoint)! });

        return Object.assign({}, ...composeOptions);
    }

    resolveIf(ctx: ParserContext, fieldConfig: StructField<T, keyof T>): boolean {
        const fieldIf = fieldConfig.if;

        if (!isUndefined(fieldIf) && isBoolean(fieldIf)) return fieldIf;
        if (!isUndefined(fieldIf) && isFunction(fieldIf)) return ctx.compute(fieldIf);

        return true;
    }

    read(ctx: ParserContext): T {
        const section = Reflect.construct(this.creator, []);

        const fieldNames: (keyof T)[] = [];
        Reflect.defineMetadata(kStructReadKeys, fieldNames, section);

        for (const fieldConfig of this.fields) {
            const fieldName = fieldConfig.name;
            const fieldParser = this.resolveParser(ctx, fieldConfig.type);
            const fieldOption = this.resolveOption(ctx, fieldConfig);
            const fieldIf = this.resolveIf(ctx, fieldConfig);

            const fieldSnap = fieldIf
                ? ctx.read(fieldParser, fieldOption)
                : ctx.result(fieldConfig.default, 0);

            const [ fieldValue ] = fieldSnap;
            Reflect.set(section, fieldName, fieldValue);

            const fieldExpose = fieldConfig.expose;

            if (!isUndefined(fieldExpose)) {
                ctx.expose(fieldExpose, fieldName, fieldValue);
            }

            if (!fieldNames.includes(fieldName)) fieldNames.push(fieldName);
            Reflect.defineMetadata(kStructReadSnap, fieldSnap, section, fieldName as string);
        }

        return section;
    }

    write(ctx: ParserContext, value: T): T {
        const fieldNames: (keyof T)[] = [];
        Reflect.defineMetadata(kStructWriteKeys, fieldNames, value);

        for (const fieldConfig of this.fields) {
            const fieldName = fieldConfig.name;
            const fieldParser = this.resolveParser(ctx, fieldConfig.type);
            const fieldOption = this.resolveOption(ctx, fieldConfig);
            const fieldIf = this.resolveIf(ctx, fieldConfig);

            const fieldValue = Reflect.get(value, fieldName);

            if (fieldName === 'itemType') {
                console.log('itemType');
            }

            // todo: why judge condition on write?
            const fieldSnap = fieldIf
                ? ctx.write(fieldParser, fieldValue, fieldOption)
                // todo: why use default on write?
                : ctx.result(fieldConfig.default, 0);

            const [ fieldValue2 ] = fieldSnap;

            const fieldExpose = fieldConfig.expose;

            if (!isUndefined(fieldExpose)) {
                ctx.expose(fieldExpose, fieldName, fieldValue2);
            }

            if (!fieldNames.includes(fieldName)) fieldNames.push(fieldName);
            Reflect.defineMetadata(kStructWriteSnap, fieldSnap, value, fieldName as string);
        }

        return value;
    }
}

const StructParserCreator = createParserCreator(StructParser);

export {
    StructParserCreator,
    StructParserCreator as Struct,
    StructParserCreator as struct,
};
