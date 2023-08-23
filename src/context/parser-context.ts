import { Ascii } from '../coding/codings.ts';
import { Endian } from '../common.ts';
import { PrimitiveParser } from '../parse/primitive-parser.ts';
import { push, slice } from '../utils/proto-fn.ts';
import { SafeAny } from '../utils/prototype-util.ts';
import { isBoolean, isString, isSymbol, isUndefined } from '../utils/type-util.ts';
import { BaseParser } from './base-parser.ts';
import { ContextCompute, ContextOption, ParserContext } from './types.ts';

// 探测当前运行环境的端序情况
function nativeEndianness(): Endian {
    const testBuffer = new ArrayBuffer(2);
    new Uint16Array(testBuffer).fill(0x0102);
    const [ left, right ] = new Uint8Array(testBuffer);
    if (left === 1 && right === 2) return 'be';
    if (left === 2 && right === 1) return 'le';
    throw Error('never');
}

const defaultContextOption: ContextOption = {
    point: 0,
    consume: true,
    ends: 0x00,
    endian: nativeEndianness(),
    coding: Ascii,
    DebugStruct: [],
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

const kAccessChain = Symbol('@@AccessChain');
const kAccessTarget = Symbol('@@AccessTarget');

function createChainAccessor<T extends object>(useTarget: boolean, ...accesses: (T | undefined)[]): Required<T> {
    const chain: T[] = [];
    for (const arg of accesses) {
        if (isUndefined(arg)) continue;
        const hasAccessTarget = kAccessTarget in arg;
        const hasAccessChain = kAccessChain in arg;
        if (useTarget && hasAccessTarget) {
            const target = Reflect.get(arg, kAccessTarget) as T;
            if (!chain.includes(target)) push.call(chain, target);
        }
        if (hasAccessChain) {
            const copy = Reflect.get(arg, kAccessChain) as T[];
            push.apply(chain, copy.filter(ctm => !chain.includes(ctm)));
        }
        if (hasAccessTarget || hasAccessChain) {
            continue;
        }
        if (!useTarget && !Object.keys(arg).length) continue;
        if (!chain.includes(arg)) push.call(chain, arg);
    }

    const target = {} as T;

    const hasKeys = new Set<string | symbol>();

    // if (chain.length > 10) {
    //     console.log(chain.length);
    // }

    function has<K extends Extract<keyof T, string | symbol>>(target: T, propKey: K): boolean {
        if (propKey === kAccessTarget) return true;
        if (propKey === kAccessChain) return true;
        if (useTarget && propKey in target) return true;
        if (hasKeys.has(propKey)) return true;
        for (const scope of chain) {
            if (propKey in scope) {
                hasKeys.add(propKey);
                return true;
            }
        }
        return false;
    }

    function get<K extends Extract<keyof T, string | symbol>>(target: T, propKey: K, receiver: SafeAny): T[K] | undefined {
        if (propKey === kAccessTarget) return target as T[K];
        if (propKey === kAccessChain) return chain as T[K];
        if (useTarget && propKey in target) return Reflect.get(target, propKey, receiver);
        for (const scope of chain) {
            if (propKey in scope) return Reflect.get(scope, propKey, receiver);
        }
        return undefined;
    }

    function set<K extends Extract<keyof T, string | symbol>>(target: T, propKey: K, value: T[K], receiver: SafeAny): boolean {
        if (propKey === kAccessTarget) return false;
        if (propKey === kAccessChain) return false;
        if (!useTarget) return false;
        hasKeys.add(propKey);
        return Reflect.set(target, propKey, value, receiver);
    }

    return new Proxy(target, { has, get, set }) as Required<T>;
}

export function createContext(buffer: ArrayBuffer, option: Partial<ContextOption> = {}): ParserContext {
    const rootOption: ContextOption = { ...defaultContextOption, ...option };

    function create(parent?: ParserContext, ...options: (ContextOption | undefined)[]): ParserContext {
        const context = {} as ParserContext;
        const scope = createChainAccessor(true, parent?.scope);
        const option = createChainAccessor(false, ...options, parent?.option, rootOption);

        const byteStart = option.point!;
        let byteSize = 0;

        function read<T>(parser: BaseParser<T>, readOption?: ContextOption): ValueSnap<T> {
            const ctx = context.derive(readOption, parser.option, { point: byteStart + byteSize });
            try {
                const value = parser.read(ctx, ctx.option.point);
                const readSize = parser instanceof PrimitiveParser
                    ? parser.byteSize
                    : ctx.size;
                if (!ctx.option.consume) return ctx.result(value, 0);
                byteSize += readSize;
                return ctx.result(value, readSize);
            } catch (e) {
                throw e;
            }
        }

        function write<T>(parser: BaseParser<T>, value: T, writeOption?: ContextOption): ValueSnap<T> {
            const ctx = context.derive(writeOption, parser.option, { point: byteStart + byteSize });
            try {
                parser.write(ctx, value, ctx.option.point);
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
            return createResult(value, createSnap(option.point, size));
        }

        return Object.defineProperties(context, {
            buffer: { writable: false, value: buffer },
            view: { writable: false, value: new DataView(buffer) },
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
