import { AdvancedParser, BaseParser, ContextCompute, createContext, ParserContext, ParserOptionComposable, ScopeAccessor, ValuePair } from './base-parser.ts';
import { isBoolean, isString, isSymbol, isUndefined } from '../utils/type-util.ts';

export type ObjectField<T, K extends keyof T> = {
    name: K,
    type: BaseParser<T[K]> | ContextCompute<BaseParser<T[K]> | undefined, T>,
    option?: ParserOptionComposable,
    condition?: {
        if?: ContextCompute<boolean, T>,
        default?: T[K]
    },
    variable?: boolean | string | symbol,
};

export type ObjectParserOption<T> = {
    type?: new () => T;
    fields: ObjectField<T, keyof T>[];
};

export const K_FieldSpec = Symbol.for('@@KeyFieldSpecs');

export type Struct = object;
export type StructSpec<T extends Struct> = { [K in keyof T]: ValuePair<T[K]> };

function setStructSpec<T extends Struct>(from: T, spec: StructSpec<T>): boolean {
    return Reflect.set(from, K_FieldSpec, spec);
}

function hasStructSpec<T extends Struct>(from: T): boolean {
    return Reflect.has(from, K_FieldSpec);
}

export function getStructSpec<T extends Struct>(from: T): StructSpec<T> | undefined {
    return Reflect.get(from, K_FieldSpec) as StructSpec<T>;
}

export class StructParser<T extends Struct> extends AdvancedParser<T> {
    private readonly fields: ObjectField<T, keyof T>[];
    private readonly creator: new () => T;

    constructor(option: ObjectParserOption<T>) {
        super();
        this.fields = option.fields;
        this.creator = option.type || Object as unknown as new () => T;
    }

    addScopeVariable<K extends keyof T>(scope: ScopeAccessor, fieldVariable: boolean | string | symbol, fieldName: K, fieldValue: T[K]) {
        if (isBoolean(fieldVariable)) {
            Reflect.set(scope, fieldName, fieldValue);
        }
        if (isString(fieldVariable) || isSymbol(fieldVariable)) {
            Reflect.set(scope, fieldVariable, fieldValue);
        }
    }

    resolveParser<T, K extends keyof T>(ctx: ParserContext<unknown>, type: BaseParser<T[K]> | ContextCompute<BaseParser<T[K]> | undefined, T>): BaseParser<T[K]> {
        if (type instanceof BaseParser) return type;
        const resolved = this.compute(ctx, type);
        if (resolved instanceof BaseParser) return resolved;
        throw Error('Cannot resolve that type as any Parser');
    }

    read(ctx: ParserContext<unknown>, byteOffset: number, option?: ParserOptionComposable): ValuePair<T> {
        const section = Reflect.construct(this.creator, []);
        const childCtx = createContext(ctx, section);
        let currentOffset = byteOffset;

        const structSpec = {} as StructSpec<T>;
        setStructSpec(section, structSpec);

        for (const fieldConfig of this.fields) {
            const fieldName = fieldConfig.name;
            const fieldParser = this.resolveParser(childCtx, fieldConfig.type);
            const fieldOption = fieldConfig.option;

            const fieldSpec =
                !(fieldConfig.condition?.if && !this.compute(ctx, fieldConfig.condition.if!))
                    ? fieldParser.read(childCtx, currentOffset, { ...option, ...fieldOption })
                    : fieldParser.default(fieldConfig.condition?.default, byteOffset, 0);

            const [ fieldValue, { size: byteSize } ] = fieldSpec;
            Reflect.set(section, fieldName, fieldValue);

            const fieldVariable = fieldConfig.variable;

            if (!isUndefined(fieldVariable)) {
                this.addScopeVariable(childCtx.scope, fieldVariable, fieldName, fieldValue);
            }

            Reflect.set(structSpec, fieldName, fieldSpec);
            currentOffset += byteSize;
        }

        return this.valuePair(section, byteOffset, currentOffset - byteOffset);
    }

    write(ctx: ParserContext<unknown>, byteOffset: number, value: T, option?: ParserOptionComposable): ValuePair<T> {
        const childCtx = createContext(ctx, value);
        let currentOffset = byteOffset;

        const structSpec = hasStructSpec(value)
            ? (() => {
                const oldSpec = getStructSpec(value)!;
                Reflect.ownKeys(oldSpec).forEach(key => Reflect.deleteProperty(oldSpec, key));
                return oldSpec;
            })()
            : (() => {
                const newSpec = {} as StructSpec<T>;
                setStructSpec(value, newSpec);
                return newSpec;
            })();

        for (const fieldConfig of this.fields) {
            const fieldName = fieldConfig.name;
            const fieldParser = this.resolveParser(childCtx, fieldConfig.type);
            const fieldOption = fieldConfig.option;

            const fieldValue = Reflect.get(value, fieldName);

            const fieldSpec =
                // todo: why judge condition on write?
                !(fieldConfig.condition?.if && !this.compute(ctx, fieldConfig.condition.if!))
                    ? fieldParser.write(childCtx, currentOffset, fieldValue, { ...option, ...fieldOption })
                    // todo: why use default on write?
                    : fieldParser.default(fieldConfig.condition?.default, byteOffset, 0);

            const [ fieldValue2, { size: byteSize } ] = fieldSpec;

            const fieldVariable = fieldConfig.variable;
            if (!isUndefined(fieldVariable)) {
                this.addScopeVariable(childCtx.scope, fieldVariable, fieldName, fieldValue2);
            }

            Reflect.set(structSpec, fieldName, fieldSpec);
            currentOffset += byteSize;
        }

        return this.valuePair(value, byteOffset, currentOffset - byteOffset);
    }
}

export function getStructParser<T extends Struct>(parserOption: ObjectParserOption<T>): StructParser<T> {
    return new StructParser(parserOption);
}
