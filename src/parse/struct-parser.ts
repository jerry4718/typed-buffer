import { AdvancedParser, BaseParser, BaseParserConfig } from '../context/base-parser.ts';
import { isUndefined } from '../utils/type-util.ts';
import { ContextCompute, ContextOption, ParserContext } from '../context/types.ts';
import { ValueSnap } from '../context/parser-context.ts';

export type StructField<T, K extends keyof T> = {
    name: K,
    type: BaseParser<T[K]> | ContextCompute<BaseParser<T[K]> | undefined>,
    option?: ContextOption,
    condition?: {
        if?: ContextCompute<boolean>,
        default?: T[K]
    },
    expose?: boolean | string | symbol,
};

export type StructParserConfig<T> =
    & BaseParserConfig
    & { type?: new () => T }
    & { fields: StructField<T, keyof T>[] }

export const FieldSnapKey = Symbol.for('@@KeyFieldSnap');

export type StructObject = object;
export type StructSnap<T extends StructObject> = { [K in keyof T]: ValueSnap<T[K]> };

function setStructSnap<T extends StructObject>(from: T, snap: StructSnap<T>): boolean {
    return Reflect.set(from, FieldSnapKey, snap);
}

function hasStructSnap<T extends StructObject>(from: T): boolean {
    return Reflect.has(from, FieldSnapKey);
}

export function getStructSnap<T extends StructObject>(from: T): StructSnap<T> | undefined {
    return Reflect.get(from, FieldSnapKey) as StructSnap<T>;
}

export class StructParser<T extends StructObject> extends AdvancedParser<T> {
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

    read(ctx: ParserContext): T {
        const section = Reflect.construct(this.creator, []);

        const structSnap = {} as StructSnap<T>;
        setStructSnap(section, structSnap);

        for (const fieldConfig of this.fields) {
            const fieldName = fieldConfig.name;
            const fieldParser = this.resolveParser(ctx, fieldConfig.type);
            const fieldOption = fieldConfig.option;

            const fieldSnap =
                !(fieldConfig.condition?.if && !ctx.compute(fieldConfig.condition.if!))
                    ? ctx.read(fieldParser, fieldOption)
                    : ctx.result(fieldConfig.condition?.default, 0);

            const [ fieldValue ] = fieldSnap;
            Reflect.set(section, fieldName, fieldValue);

            const fieldExpose = fieldConfig.expose;

            if (!isUndefined(fieldExpose)) {
                ctx.expose(fieldExpose, fieldName, fieldValue);
            }

            Reflect.set(structSnap, fieldName, fieldSnap);
        }

        return section;
    }

    write(ctx: ParserContext, value: T): T {
        const structSnap = hasStructSnap(value)
            ? (() => {
                const oldSnap = getStructSnap(value)!;
                Reflect.ownKeys(oldSnap).forEach(key => Reflect.deleteProperty(oldSnap, key));
                return oldSnap;
            })()
            : (() => {
                const newSnap = {} as StructSnap<T>;
                setStructSnap(value, newSnap);
                return newSnap;
            })();

        for (const fieldConfig of this.fields) {
            const fieldName = fieldConfig.name;
            const fieldParser = this.resolveParser(ctx, fieldConfig.type);
            const fieldOption = fieldConfig.option;

            const fieldValue = Reflect.get(value, fieldName);

            if (fieldName === 'itemType') {
                console.log('itemType')
            }
            const fieldSnap =
                // todo: why judge condition on write?
                !(fieldConfig.condition?.if && !ctx.compute(fieldConfig.condition.if!))
                    ? ctx.write(fieldParser, fieldValue, fieldOption)
                    // todo: why use default on write?
                    : ctx.result(fieldConfig.condition?.default, 0);

            const [ fieldValue2 ] = fieldSnap;

            const fieldExpose = fieldConfig.expose;

            if (!isUndefined(fieldExpose)) {
                ctx.expose(fieldExpose, fieldName, fieldValue2);
            }

            Reflect.set(structSnap, fieldName, fieldSnap);
        }

        return value;
    }
}

export function getStructParser<T extends StructObject>(option: StructParserConfig<T>): StructParser<T> {
    return new StructParser(option);
}

export {
    StructParser as Struct,
};
