import { Endian } from '../common.ts';

export type ScopeAccessor =
    & object
    & { [k in string]: unknown }
    & { [k in symbol]: unknown }
    & { [k in number]: unknown }

export type ParserContext<T, P = unknown, R = unknown> = {
    buffer: ArrayBuffer,
    scope: ScopeAccessor,
    section?: Partial<T>,
    parent?: P,
    root?: R,
}

/*class ParserBaseContext<T> {
    constructor(
        public buffer: ArrayBuffer,
        public scope: ScopeAccessor = {},
    ) {

    }
}

class ParserRootContext<R> extends ParserBaseContext<R> {
    constructor() {
        super();
    }

    subContext<S>(): ParserSubContext<S, R, R> {
        return undefined;
    }
}

class ParserSubContext<T, P, R> extends ParserBaseContext<T> {
    parent?: P;
    root?: R;

    constructor(parent: ParserBaseContext<T>) {
        super();
    }

    subContext<S>(): ParserSubContext<S, T, R> {
        return undefined;
    }
}*/

export type ContextCompute<Result, CT, CP = unknown, CR = unknown> = (ctx: ParserContext<CT, CP, CR>, scope: ScopeAccessor) => Result

export function createContext<P, T = unknown>(parent?: ParserContext<P>, section?: Partial<T>): ParserContext<T, P> {
    let initSection = section;

    const sectionDescriptor: PropertyDescriptor = {
        get() {
            return initSection;
        },
        set(value: Partial<T>) {
            initSection = value;
        },
    };

    const parentScope = parent?.scope || {};
    const scopeHolder = {};
    const scopeGetter = new Proxy(scopeHolder, {
        get: function (_, propKey, receiver) {
            if (Object.hasOwn(scopeHolder, propKey)) {
                return Reflect.get(scopeHolder, propKey, receiver);
            }
            return Reflect.get(parentScope, propKey, receiver);
        },
        set: function (_, propKey, value, receiver) {
            return Reflect.set(scopeHolder, propKey, value, receiver);
        },
    });

    return Object.defineProperties(
        {} as ParserContext<T, P>,
        {
            buffer: { get: () => parent?.buffer },
            section: sectionDescriptor,
            parent: { get: () => parent?.section },
            root: { get: () => parent?.root ?? section },
            scope: { get: () => scopeGetter },
        },
    );
}

interface SpecInfo {
    size: number,
    start: number,
    end: number,
    pos: [ number, number ]
}

export interface ValueSpec<T> {
    value: T,
    spec: SpecInfo,
    byteSize: SpecInfo['size'],
    offsetStart: SpecInfo['start'],
    offsetEnd: SpecInfo['end'],
    offset: SpecInfo['pos']
}

export type ValueDesc<T> = [ T, SpecInfo ] & ValueSpec<T>;

export interface ParserOptionComposable {
    end?: number,
    endian?: Endian,
}

function createSpec(byteOffset: number, byteSize: number): SpecInfo {
    const offsetStart = byteOffset;
    const offsetEnd = byteOffset + byteSize;

    return Object.defineProperties(
        {} as SpecInfo,
        {
            size: { enumerable: true, writable: false, value: byteSize },
            start: { enumerable: true, writable: false, value: offsetStart },
            end: { enumerable: true, writable: false, value: offsetEnd },
            pos: { enumerable: true, get: () => [ offsetStart, offsetEnd ] },
        },
    );
}

function valueDesc<T>(value: T, byteOffset: number, byteSize: number): ValueDesc<T> {
    const spec = createSpec(byteOffset, byteSize);
    const pair = [ value, spec ];

    return Object.defineProperties(
        pair as ValueDesc<T>,
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
    compute<Result, CT, CP = unknown, CR = unknown>(context: ParserContext<CT, CP, CR>, getter: ContextCompute<Result, CT, CP, CR>): Result;

    read(parentContext: ParserContext<unknown>, byteOffset: number, option?: ParserOptionComposable): ValueDesc<T>;

    write(parentContext: ParserContext<unknown>, byteOffset: number, value: T, option?: ParserOptionComposable): ValueDesc<T>;

    default(value: T | undefined, byteOffset: number, byteSize: number): ValueDesc<T>;

    valueDesc(value: T, byteOffset: number, byteSize: number): ValueDesc<T>;
}

export abstract class BaseParser<T> implements Parser<T> {

    abstract read(parentContext: ParserContext<unknown>, byteOffset: number, option?: ParserOptionComposable): ValueDesc<T>;

    abstract write(parentContext: ParserContext<unknown>, byteOffset: number, value: T, option?: ParserOptionComposable): ValueDesc<T>;

    compute<Result, CT, CP = unknown, CR = unknown>(context: ParserContext<CT, CP, CR>, getter: ContextCompute<Result, CT, CP, CR>): Result {
        return getter(context, context.scope);
    }

    default(value: T | undefined, byteOffset: number, byteSize = 0): ValueDesc<T> {
        return valueDesc(value!, byteOffset, byteSize);
    }

    valueDesc(value: T, byteOffset: number, byteSize: number): ValueDesc<T> {
        return valueDesc(value, byteOffset, byteSize);
    }

    static valueDesc<U>(value: U, byteOffset: number, byteSize: number): ValueDesc<U> {
        return valueDesc(value, byteOffset, byteSize);
    }
}

export abstract class AdvancedParser<T> extends BaseParser<T> {
}
