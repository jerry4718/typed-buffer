import { isBoolean, isString, isSymbol } from '../utils/type-util.ts';
import { ContextCompute, ContextOption, Parser, ParserContext } from './types.ts';
import { PrimitiveParser } from '../parse/primitive-parser.ts';
import { Endian } from '../common.ts';

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

export function createContext(buffer: ArrayBuffer, option: Partial<ContextOption> = {}): ParserContext {
    const rootOption: ContextOption = { ...defaultContextOption, ...option };

    function create(parent?: ParserContext, option: Partial<ContextOption> = {}): ParserContext {
        const context = {} as ParserContext;

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

        const parentOption = parent?.option;
        const optionAccessor = new Proxy(option as ContextOption, {
            get: function (target, propKey, receiver) {
                if (Object.hasOwn(target, propKey)) return Reflect.get(target, propKey, receiver);
                if (parentOption && Object.hasOwn(parentOption, propKey)) return Reflect.get(parentOption, propKey, receiver);
                if (Object.hasOwn(rootOption, propKey)) return Reflect.get(rootOption, propKey, receiver);
                return undefined;
            },
        });

        const byteStart = option.offset || parent?.option.offset || rootOption.offset;
        let byteSize = 0;

        function read<T>(parser: Parser<T>, option?: ContextOption): ValueSnap<T> {
            const ctx = context.derive({
                offset: byteStart + byteSize,
                ...option,
            });
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

        function write<T>(parser: Parser<T>, value: T, option?: ContextOption): ValueSnap<T> {
            const ctx = context.derive({
                offset: optionAccessor.offset + byteSize,
                ...option,
            });
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
                return Reflect.set(scopeAccessor, name, value);
            }
            if (isString(condition) || isSymbol(condition)) {
                return Reflect.set(scopeAccessor, condition, value);
            }
        }

        function compute<Result>(getter: ContextCompute<Result>): Result {
            return getter(context, scopeAccessor);
        }

        function result<T>(value: T, size = byteSize): ValueSnap<T> {
            return createResult(value, createSnap(optionAccessor.offset, size));
        }

        return Object.defineProperties(context, {
            buffer: { writable: false, value: buffer },
            scope: { writable: false, value: scopeAccessor },
            option: { writable: false, value: optionAccessor },
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
