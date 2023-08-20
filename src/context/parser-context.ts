import { isBoolean, isString, isSymbol } from '../utils/type-util.ts';
import { ContextCompute, ContextOption, ParserContext } from './types.ts';
import { PrimitiveParser } from '../parse/primitive-parser.ts';
import { Endian } from '../common.ts';
import { BaseParser } from './base-parser.ts';
import { SafeAny } from '../utils/prototype-util.ts';

const defaultContextOption: ContextOption = {
    offset: 0,
    consume: true,
    ends: 0x00,
    endian: 'be',
};

export interface SnapInfo {
    start: number,
    size: number,
    end: number,
    pos: [ number, number ]
}

export interface WithValue<T> {
    value: T,
}

export interface WithSnap {
    snap: SnapInfo;
}

export type ValueSnap<T> =
    & [ T, SnapInfo ]
    & WithValue<T>
    & WithSnap
    & SnapInfo;

export interface ParserOptionComposable {
    pos?: number,
    ends?: number,
    endian?: Endian,
}

export function createSnap(byteStart: number, byteSize: number): SnapInfo {
    const byteEnd = byteStart + byteSize;

    return Object.defineProperties(
        {} as SnapInfo,
        {
            start: { enumerable: true, writable: false, value: byteStart },
            size: { enumerable: true, writable: false, value: byteSize },
            end: { enumerable: true, writable: false, value: byteEnd },
            pos: { enumerable: true, get: () => [ byteStart, byteEnd ] },
        },
    );
}

export function createResult<T>(value: T, snap: SnapInfo): ValueSnap<T> {
    const pair = [ value, snap ];

    return Object.defineProperties(
        pair as ValueSnap<T>,
        {
            value: { enumerable: false, writable: false, value: value },
            snap: { enumerable: false, writable: false, value: snap },
            start: { enumerable: false, get: () => snap.start },
            size: { enumerable: false, get: () => snap.size },
            end: { enumerable: false, get: () => snap.end },
            pos: { enumerable: false, get: () => snap.pos },
        },
    );
}

function createChainAccessor<T extends object>(space: boolean, ...upward: (T | undefined)[]): T {
    const target = {} as T;

    function has<K extends Extract<keyof T, string | symbol>>(target: T, propKey: K): boolean {
        if (space && Object.hasOwn(target, propKey)) return true;
        for (const scope of upward) {
            if (scope && Object.hasOwn(scope, propKey)) return true;
        }
        return false;
    }

    function get<K extends Extract<keyof T, string | symbol>>(target: T, propKey: K, receiver: SafeAny): T[K] | undefined {
        if (space && Object.hasOwn(target, propKey)) return Reflect.get(target, propKey, receiver);
        for (const scope of upward) {
            if (scope && Object.hasOwn(scope, propKey)) return Reflect.get(scope, propKey, receiver);
        }
        return undefined;
    }

    function set<K extends Extract<keyof T, string | symbol>>(target: T, propKey: K, value: T[K], receiver: SafeAny): boolean {
        if (!space) return false;
        return Reflect.set(target, propKey, value, receiver);
    }

    return new Proxy(target, { has, get, set });
}

export function createContext(buffer: ArrayBuffer, option: Partial<ContextOption> = {}): ParserContext {
    const rootOption: ContextOption = { ...defaultContextOption, ...option };

    function create(parent?: ParserContext, ...options: (ContextOption | undefined)[]): ParserContext {
        const context = {} as ParserContext;
        const scope = createChainAccessor(true, parent?.scope);
        const option = createChainAccessor(false, parent?.option, ...options.reverse(), rootOption);

        const byteStart = option.offset!;
        let byteSize = 0;

        function read<T>(parser: BaseParser<T>, option?: ContextOption): ValueSnap<T> {
            const ctx = context.derive({ offset: byteStart + byteSize }, parser.option, option);
            try {
                const value = parser.read(ctx, ctx.option.offset);
                if (!ctx.option.consume) return ctx.result(value, 0);
                const readSize = parser instanceof PrimitiveParser
                    ? parser.byteSize
                    : ctx.size;
                byteSize += readSize;
                return ctx.result(value, readSize);
            } catch (e) {
                throw e;
            }
        }

        function write<T>(parser: BaseParser<T>, value: T, option?: ContextOption): ValueSnap<T> {
            const ctx = context.derive({ offset: byteStart + byteSize }, parser.option, option);
            try {
                parser.write(ctx, value, ctx.option.offset);
                if (!ctx.option.consume) return ctx.result(value, 0);
                const writeSize = parser instanceof PrimitiveParser
                    ? parser.byteSize
                    : ctx.size;
                byteSize += writeSize;
                return ctx.result(value, writeSize);
            } catch (e) {
                throw e;
            }
        }

        function expose(condition: string | boolean | symbol, name: string | number | symbol, value: unknown) {
            if (isBoolean(condition)) {
                return Reflect.set(scope, name, value);
            }
            if (isString(condition) || isSymbol(condition)) {
                return Reflect.set(scope, condition, value);
            }
        }

        function compute<Result>(getter: ContextCompute<Result>): Result {
            return getter(context, scope);
        }

        function result<T>(value: T, size = byteSize): ValueSnap<T> {
            return createResult(value, createSnap(option.offset, size));
        }

        return Object.defineProperties(context, {
            buffer: { writable: false, value: buffer },
            option: { writable: false, value: option },
            scope: { writable: false, value: scope },
            read: { writable: false, value: read },
            write: { writable: false, value: write },
            expose: { writable: false, value: expose },
            compute: { writable: false, value: compute },
            result: { writable: false, value: result },
            derive: { writable: false, value: create.bind(void 0, context) },
            size: { get: () => byteSize },
            take: { get: () => [ byteStart, byteStart + byteSize ] },
        });
    }

    return create();
}
