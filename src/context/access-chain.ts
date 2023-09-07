import { ObjectPrototype, ObjectPrototypeKeys, PublicSymbolAccessors, push, SafeAny, slice } from '../utils/prototype-util.ts';
import { isUndefined } from '../utils/type-util.ts';
import { ContextOption, ScopeAccessor } from "./types.ts";

const kAccessChain = Symbol('@@AccessChain');
const kAccessTarget = Symbol('@@AccessTarget');

const EmptyObject = Object.freeze({});
createAccessChain.ct = {
    create: 0,
    has: 0,
    get: 0,
    set: 0,
};

export function createAccessChain<
    T extends object,
    R = T extends Partial<infer P> ? P : T
>(useTarget: boolean, ...accesses: (T | undefined)[]): R {
    createAccessChain.ct.create ++;
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
        if (hasAccessTarget || hasAccessChain) continue;
        if (!useTarget && !Object.keys(arg).length) continue;

        if (chain.includes(arg as T)) continue;
        push.call(chain, arg);
    }

    const target = (useTarget ? {} : EmptyObject) as T;

    // if (chain.length > 20) {
    //     debugger
    // }

    function has<K extends Extract<keyof T, string | symbol>>(target: T, propKey: K): boolean {
        createAccessChain.ct.has ++;
        if (propKey === kAccessTarget) return true;
        if (propKey === kAccessChain) return true;
        if (useTarget && propKey in target) return true;
        for (const scope of chain) {
            if (propKey in scope) return true;
        }
        return false;
    }

    function get<K extends Extract<keyof T, string | symbol>>(target: T, propKey: K, receiver: SafeAny): T[K] | undefined {
        createAccessChain.ct.get ++;
        if (propKey === kAccessTarget) return target as T[K];
        if (propKey === kAccessChain) return chain as T[K];
        if (useTarget) {
            if (ObjectPrototypeKeys.includes(propKey)) return Reflect.get(target, propKey, receiver);
            if (PublicSymbolAccessors.includes(propKey)) return Reflect.get(target, propKey, receiver);
            if (propKey in target) return Reflect.get(target, propKey, receiver);
        }
        for (const scope of chain) {
            if (propKey in scope) return Reflect.get(scope, propKey, receiver);
        }
        if (useTarget) throw Error(`cannot access ${ String(propKey) } on chainAccessor`);
        return undefined;
    }

    function set<K extends Extract<keyof T, string | symbol>>(target: T, propKey: K, value: T[K], receiver: SafeAny): boolean {
        createAccessChain.ct.set ++;
        if (propKey === kAccessTarget) return false;
        if (propKey === kAccessChain) return false;
        if (!useTarget) return false;
        return Reflect.set(target, propKey, value, receiver);
    }

    return new Proxy(target, { has, get, set }) as unknown as R;
}

const ScopeChainTarget = Object.freeze({});

export function optionChain(...options: (Partial<ContextOption> | undefined)[]): ContextOption;
export function optionChain() {
    const options = slice.call(arguments) as ContextOption[];
    let prev: ContextOption | null = null;
    for (const option of options.reverse()) {
        if (!option) continue;
        if (Object.keys(option).length === 0) continue;
        if (Object.getPrototypeOf(option) === ObjectPrototype) {
            Object.setPrototypeOf(option, prev);
            prev = option;
            continue;
        }
        if (prev === null) {
            prev = option;
            continue;
        }
        throw Error('cant append this option to chain');
    }
    return prev || Object.create(prev);
}

export function scopeChain(parent: ScopeAccessor | null = null): ScopeAccessor {
    return Object.create(parent) as ScopeAccessor;
}

function createScope0(parent?: ScopeAccessor): ScopeAccessor {
    const scope = new Map<string | symbol, unknown>();
    const cache = new Map<string | symbol, unknown>();

    function has<K extends string | symbol>(_: SafeAny, propKey: K): boolean {
        if (scope.has(propKey)) return true; // 优先从自身 scope 访问
        if (cache.has(propKey)) return true; // 判断是否有过缓存（该缓存同样适用于后代scope的访问）
        if (parent && propKey in parent) {
            // has的同时也存入cache
            const value = Reflect.get(parent, propKey);
            cache.set(propKey, value);
            return true;
        }
        return false;
    }

    function get<K extends string | symbol>(_: SafeAny, propKey: K, receiver: SafeAny): unknown {
        if (scope.has(propKey)) return scope.get(propKey); // 优先从自身 scope 访问
        if (cache.has(propKey)) return cache.get(propKey); // 判断是否有过缓存（该缓存同样适用于后代scope的访问）
        if (parent && propKey in parent) {
            // get的同时存入cache
            const value = Reflect.get(parent, propKey, receiver);
            cache.set(propKey, value);
            return value;
        }
        return undefined;
    }

    function set<K extends string | symbol>(_: SafeAny, propKey: K, value: unknown, receiver: SafeAny): boolean {
        scope.set(propKey, value);
        return true;
    }

    return new Proxy(ScopeChainTarget, { has, get, set }) as ScopeAccessor;
}
