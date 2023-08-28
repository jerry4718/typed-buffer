import { ArrayParser } from './array-parser.ts';
import { PrimitiveParser } from './primitive-parser.ts';
import { AdvancedParser, BaseParser, AdvancedParserConfig, createParserCreator } from '../context/base-parser.ts';
import { ContextCompute, ContextOption, ParserContext } from '../context/types.ts';
import { assertType, isBoolean, isFunction, isNumber, isString, isSymbol, isUndefined } from '../utils/type-util.ts';
import { SnapTuple } from '../context/parser-context.ts';
import { SafeAny } from '../utils/prototype-util.ts';

export type StructFieldBasic<T, K extends keyof T> = {
    name: K,
    expose?: boolean | string | symbol,
    setup?: { name: string, value: SafeAny | ContextCompute<SafeAny> }[],
}

export type StructFieldVirtual<T, K extends keyof T> = StructFieldBasic<T, K> & {
    resolve: T[K] | ContextCompute<T[K]>,
}

export type StructFieldActual<T, K extends keyof T> = StructFieldBasic<T, K> & {
    type: BaseParser<T[K]> | ContextCompute<BaseParser<T[K]> | undefined>,
    point?: number | ContextCompute<number>,
    if?: boolean | ContextCompute<boolean>,
    default?: T[K] | ContextCompute<T[K]>,
};

export type StructField<T, K extends keyof T> =
    | (StructFieldVirtual<T, K>)
    | (StructFieldActual<T, K>)

export type StructParserConfig<T> =
    & AdvancedParserConfig
    & { type?: new () => T }
    & { fields: StructField<T, keyof T>[] }

export const kStructReadSnap = Symbol.for('@@StructReadSnap');
export const kStructReadKeys = Symbol.for('@@StructReadKeys');
export const kStructWriteSnap = Symbol.for('@@StructWriteSnap');
export const kStructWriteKeys = Symbol.for('@@StructWriteKeys');

export type StructSnap<T extends object> = { [K in keyof T]: SnapTuple<T[K]> };

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

    judgeFieldConfig(fieldConfig: StructField<T, keyof T>) {
        const isStructFieldVirtual = Object.hasOwn(fieldConfig, 'resolve');
        const isStructFieldActual = Object.hasOwn(fieldConfig, 'type');

        if (!(isStructFieldVirtual || isStructFieldActual)) {
            throw Error('StructField has neither ’resolve’ nor ‘type’');
        }

        return { isStructFieldVirtual, isStructFieldActual };
    }

    resolveParser<K extends keyof T>(ctx: ParserContext, fieldConfig: StructFieldActual<T, K>): BaseParser<T[K]> {
        const fieldType = fieldConfig.type;
        if (fieldType instanceof BaseParser) return fieldType;
        const resolved = ctx.compute(fieldType);
        if (resolved instanceof BaseParser) return resolved;
        throw Error('Cannot resolve that type as any Parser');
    }

    resolveOption(ctx: ParserContext, fieldConfig: StructFieldActual<T, keyof T>): Partial<ContextOption> | undefined {
        const inputPoint = (fieldConfig as StructFieldActual<T, keyof T>).point;

        if (!isUndefined(inputPoint)) {
            if (isNumber(inputPoint)) return { point: inputPoint };
            if (isFunction(inputPoint)) return { point: ctx.compute(inputPoint)! };
        }
    }

    resolveIf(ctx: ParserContext, fieldConfig: StructFieldActual<T, keyof T>): boolean {
        const fieldIf = fieldConfig.if;

        if (!isUndefined(fieldIf)) {
            if (isBoolean(fieldIf)) return fieldIf;
            if (isFunction(fieldIf)) return ctx.compute(fieldIf);
        }

        return true;
    }

    applySetup(ctx: ParserContext, fieldConfig: StructField<T, keyof T>): boolean {
        const fieldSetup = fieldConfig.setup || [];

        for (const { name, value } of fieldSetup) {
            ctx.expose(name, isFunction(value) ? ctx.compute(value) : value);
        }

        return true;
    }

    applyExpose(ctx: ParserContext, fieldConfig: StructField<T, keyof T>, value: T[keyof T]) {
        const fieldExpose = fieldConfig.expose;
        if (isBoolean(fieldExpose)) {
            return ctx.expose(fieldConfig.name, value);
        }
        if (isString(fieldExpose) || isSymbol(fieldExpose)) {
            return ctx.expose(fieldExpose, value);
        }
    }

    sizeof(ctx?: ParserContext): number {
        const actualFields = this.fields.filter(field => 'type' in field) as StructFieldActual<T, keyof T>[];
        if (actualFields.length === 0) return 0;

        if (!ctx) {
            let countSize = 0;
            for (const { type: fieldType, if: fieldIf } of actualFields) {
                if (fieldIf) return NaN;

                if (fieldType instanceof PrimitiveParser) {
                    countSize += fieldType.byteSize;
                    continue;
                }

                if (fieldType instanceof AdvancedParser) {
                    countSize += fieldType.sizeof();
                    continue;
                }
                return NaN;
            }
            return countSize;
        }

        let countSize = 0;
        for (const field of actualFields) {
            if (isNaN(countSize)) return countSize;
            const fieldIf = this.resolveIf(ctx, field);
            if (!fieldIf) continue;

            const fieldParser = this.resolveParser(ctx, field);
            const fieldOption = this.resolveOption(ctx, field);

            if (!(fieldOption?.consume || ctx.option.consume)) continue;

            if (fieldParser instanceof PrimitiveParser) {
                countSize += fieldParser.byteSize;
                continue;
            }

            if (fieldParser instanceof AdvancedParser) {
                countSize += fieldParser.sizeof(ctx);
                continue;
            }
            return NaN;
        }
        return countSize;
    }

    read(ctx: ParserContext): T {
        const debug = ctx.constant.DebugStruct.includes(this.creator);
        const section = Reflect.construct(this.creator, []);

        const fieldNames: (keyof T)[] = [];
        Reflect.defineMetadata(kStructReadKeys, fieldNames, section);

        const parentPath = ctx.scope[ctx.constant.$path];
        const parentStart = `${parentPath} {`;
        const parentEnd = `${parentPath} }`;

        if (debug) {
            console.log(parentStart);
            console.time(parentEnd);
        }

        for (const fieldConfig of this.fields) {
            const fieldName = fieldConfig.name;
            const fieldPath = `${parentPath}.${String(fieldName)}`;
            ctx.expose(ctx.constant.$path, fieldPath);

            const { isStructFieldVirtual, isStructFieldActual } = this.judgeFieldConfig(fieldConfig);

            this.applySetup(ctx, fieldConfig);

            if (debug) {
                console.time(fieldPath);
            }

            if (isStructFieldVirtual && assertType<StructFieldVirtual<T, keyof T>>(fieldConfig)) {
                const fieldResolve = fieldConfig.resolve;
                const resolvedValue = isFunction(fieldResolve) ? ctx.compute(fieldResolve) : fieldResolve;
                Reflect.set(section, fieldName, resolvedValue);
                this.applyExpose(ctx, fieldConfig, resolvedValue);
            }

            if (isStructFieldActual && assertType<StructFieldActual<T, keyof T>>(fieldConfig)) {
                const fieldParser = this.resolveParser(ctx, fieldConfig);
                const fieldOption = this.resolveOption(ctx, fieldConfig);
                const fieldIf = this.resolveIf(ctx, fieldConfig);

                const [ readRes, readSnap ] = fieldIf
                    ? ctx.read(fieldParser, fieldOption) as SnapTuple<T[keyof T]>
                    : ctx.result(fieldConfig.default, 0) as SnapTuple<T[keyof T]>;

                if (!fieldNames.includes(fieldName)) fieldNames.push(fieldName);
                Reflect.defineMetadata(kStructReadSnap, readSnap, section, fieldName as string);

                Reflect.set(section, fieldName, readRes);
                this.applyExpose(ctx, fieldConfig, readRes);
            }

            if (debug) {
                console.timeEnd(fieldPath);
            }
        }

        if (debug) {
            console.timeEnd(parentEnd);
        }

        return section;
    }

    write(ctx: ParserContext, value: T): T {
        const fieldNames: (keyof T)[] = [];
        Reflect.defineMetadata(kStructWriteKeys, fieldNames, value);

        for (const fieldConfig of this.fields) {
            const { isStructFieldVirtual, isStructFieldActual } = this.judgeFieldConfig(fieldConfig);

            this.applySetup(ctx, fieldConfig);
            const fieldName = fieldConfig.name;
            const fieldValue = Reflect.get(value, fieldName);

            if (isStructFieldVirtual && assertType<StructFieldVirtual<T, keyof T>>(fieldConfig)) {
                const fieldResolve = fieldConfig.resolve;
                const resolvedValue = isFunction(fieldResolve) ? ctx.compute(fieldResolve) : fieldResolve;
                if (fieldValue !== resolvedValue) console.warn(`field [${String(fieldName)}] cannot compare with resolved`);
                this.applyExpose(ctx, fieldConfig, resolvedValue);
            }

            if (isStructFieldActual && assertType<StructFieldActual<T, keyof T>>(fieldConfig)) {
                const fieldParser = this.resolveParser(ctx, fieldConfig);
                const fieldOption = this.resolveOption(ctx, fieldConfig);
                const fieldIf = this.resolveIf(ctx, fieldConfig);

                const fieldValue = Reflect.get(value, fieldName);

                if (fieldName === 'itemType') {
                    console.log('itemType');
                }

                // todo: why judge condition on write?
                const [ _, fieldSnap ] = fieldIf
                    ? ctx.write(fieldParser, fieldValue, fieldOption)
                    // todo: why use default on write?
                    : ctx.result(fieldConfig.default, 0);

                if (!fieldNames.includes(fieldName)) fieldNames.push(fieldName);
                Reflect.defineMetadata(kStructWriteSnap, fieldSnap, value, fieldName as string);
                this.applyExpose(ctx, fieldConfig, fieldValue);
            }
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
