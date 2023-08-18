import { Endian } from '../common.ts';

export type ScopeAccessor =
    & object
    & { [k in string]: unknown }
    & { [k in symbol]: unknown }
    & { [k in number]: unknown }

export type ParserContext = {
    buffer: ArrayBuffer,
    scope: ScopeAccessor,
    compute<Result>(getter: ContextCompute<Result>): Result,
    derive(): ParserContext,
}

export type ContextCompute<Result> = (ctx: ParserContext, scope: ScopeAccessor) => Result

export function createContext(buffer: ArrayBuffer): ParserContext {
    function create(parent?: ParserContext) {
        const context = {} as ParserContext;

        function compute<Result>(getter: ContextCompute<Result>): Result {
            return getter(context, scopeAccessor);
        }

        const parentScope = parent?.scope;
        const scopeAccessor = new Proxy({}, {
            get: function (target, propKey, receiver) {
                if (Object.hasOwn(target, propKey)) return Reflect.get(target, propKey, receiver);
                if (parentScope) return Reflect.get(parentScope, propKey, receiver);
                return undefined;
            },
            set: function (target, propKey, value, receiver) {
                return Reflect.set(target, propKey, value, receiver);
            },
        });

        return Object.defineProperties(
            context,
            {
                buffer: { writable: false, value: buffer },
                scope: { writable: false, value: scopeAccessor },
                compute: { writable: false, value: compute },
                derive: { writable: false, value: () => create(context) },
            },
        );
    }

    return create();
}

interface SpecInfo {
    size: number,
    start: number,
    end: number,
    pos: [ number, number ]
}

export interface WithValue<T> {
    value: T,
}

export interface WithSpec {
    spec: SpecInfo;
}

export type ValueSpec<T> =
    & [ T, SpecInfo ]
    & WithValue<T>
    & WithSpec
    & SpecInfo;

export interface ParserOptionComposable {
    end?: number,
    endian?: Endian,
}

function createSpec(byteOffset: number, byteSize: number): SpecInfo {
    const start = byteOffset;
    const end = byteOffset + byteSize;

    return Object.defineProperties(
        {} as SpecInfo,
        {
            size: { enumerable: true, writable: false, value: byteSize },
            start: { enumerable: true, writable: false, value: start },
            end: { enumerable: true, writable: false, value: end },
            pos: { enumerable: true, get: () => [ start, end ] },
        },
    );
}

function valueSpec<T>(value: T, byteOffset: number, byteSize: number): ValueSpec<T> {
    const spec = createSpec(byteOffset, byteSize);
    const pair = [ value, spec ];

    return Object.defineProperties(
        pair as ValueSpec<T>,
        {
            value: { enumerable: false, writable: false, value: value },
            spec: { enumerable: false, writable: false, value: spec },
            size: { enumerable: false, get: () => spec.size },
            start: { enumerable: false, get: () => spec.start },
            end: { enumerable: false, get: () => spec.end },
            pos: { enumerable: false, get: () => spec.pos },
        },
    );
}

export interface Parser<T> {
    compute<Result>(context: ParserContext, getter: ContextCompute<Result>): Result;

    read(parentContext: ParserContext, byteOffset: number, option?: ParserOptionComposable): ValueSpec<T>;

    write(parentContext: ParserContext, byteOffset: number, value: T, option?: ParserOptionComposable): ValueSpec<T>;

    default(value: T | undefined, byteOffset: number, byteSize: number): ValueSpec<T>;

    valueSpec(value: T, byteOffset: number, byteSize: number): ValueSpec<T>;
}

export abstract class BaseParser<T> implements Parser<T> {

    abstract read(parentContext: ParserContext, byteOffset: number, option?: ParserOptionComposable): ValueSpec<T>;

    abstract write(parentContext: ParserContext, byteOffset: number, value: T, option?: ParserOptionComposable): ValueSpec<T>;

    compute<Result>(context: ParserContext, getter: ContextCompute<Result>): Result {
        return getter(context, context.scope);
    }

    default(value: T | undefined, byteOffset: number, byteSize = 0): ValueSpec<T> {
        return valueSpec(value!, byteOffset, byteSize);
    }

    valueSpec(value: T, byteOffset: number, byteSize: number): ValueSpec<T> {
        return valueSpec(value, byteOffset, byteSize);
    }

    static valueSpec<U>(value: U, byteOffset: number, byteSize: number): ValueSpec<U> {
        return valueSpec(value, byteOffset, byteSize);
    }
}

export abstract class AdvancedParser<T> extends BaseParser<T> {
}
