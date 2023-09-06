import { push } from '../utils/proto-fn.ts';
import { ObjectPrototypeKeys, PublicSymbolAccessors, SafeAny } from '../utils/prototype-util.ts';
import { isUndefined } from '../utils/type-util.ts';

const kAccessChain = Symbol('@@AccessChain');
const kAccessTarget = Symbol('@@AccessTarget');

const EmptyObject = Object.freeze({});
createAccessChain.ct = {
    create: 0 ,
    has: 0,
    get: 0,
    set: 0,
}
export function createAccessChain<T extends object, R = T extends Partial<infer P> ? P : T>(useTarget: boolean, ...accesses: (T | undefined)[]): R {
    createAccessChain.ct.create ++
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
        createAccessChain.ct.has ++
        if (propKey === kAccessTarget) return true;
        if (propKey === kAccessChain) return true;
        if (useTarget && propKey in target) return true;
        for (const scope of chain) {
            if (propKey in scope) return true;
        }
        return false;
    }

    function get<K extends Extract<keyof T, string | symbol>>(target: T, propKey: K, receiver: SafeAny): T[K] | undefined {
        createAccessChain.ct.get ++
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
        if (useTarget) throw Error(`cannot access ${String(propKey)} on chainAccessor`);
        return undefined;
    }

    function set<K extends Extract<keyof T, string | symbol>>(target: T, propKey: K, value: T[K], receiver: SafeAny): boolean {
        createAccessChain.ct.set ++
        if (propKey === kAccessTarget) return false;
        if (propKey === kAccessChain) return false;
        if (!useTarget) return false;
        return Reflect.set(target, propKey, value, receiver);
    }

    return new Proxy(target, { has, get, set }) as unknown as R;
}
