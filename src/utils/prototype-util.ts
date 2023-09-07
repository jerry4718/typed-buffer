import 'reflect-metadata';
import { TypedArrayConstructor } from './typed-array.ts';

// deno-lint-ignore ban-types
export type Constructor<T> = T extends object ? Function & (new (...args: unknown[]) => T) : never;
// deno-lint-ignore no-explicit-any
export type SafeAny = any;

export const FunctionPrototype = Object.getPrototypeOf(Function);
export const ObjectPrototype = Object.prototype;
export const ArrayPrototype = Array.prototype;
export const ObjectPrototypeKeys = Reflect.ownKeys(ObjectPrototype);
export const PublicSymbolAccessors = Reflect.ownKeys(Symbol)
    .map(k => Reflect.get(Symbol, k))
    .filter(s => typeof s === 'symbol');

export const slice = ArrayPrototype.slice;
export const push = ArrayPrototype.push;
export const call = Function.prototype.call;
export const toString = ObjectPrototype.toString;

export const AbstractTypedArray = Reflect.getPrototypeOf(Uint8Array) as TypedArrayConstructor<number | bigint, unknown>;

export function isExtendFrom<P>(childClass: unknown, parentClass: Constructor<P>): childClass is Constructor<P> {
    for (
        let currentClass = Object.getPrototypeOf(childClass);
        currentClass !== FunctionPrototype;
        currentClass = Object.getPrototypeOf(currentClass)
    ) {
        if (currentClass !== parentClass) continue;
        return true;
    }
    return false;
}

// deno-lint-ignore no-empty-interface
export interface MetadataKey<T> extends Symbol {
}

export function getInheritedMetadata<T>(metadataKey: MetadataKey<T>, klass: new () => unknown): T[] {
    const result: T[] = [];
    let cur = klass;
    while (cur !== FunctionPrototype) {
        result.unshift(Reflect.getMetadata(metadataKey, cur));
        cur = Object.getPrototypeOf(cur);
    }
    return result;
}

export function getPrototypeMetadata<T>(metadataKey: MetadataKey<T>, klass: new () => unknown): T[] {
    const result: T[] = [];
    let cur = klass.prototype;
    while (cur.constructor !== Object) {
        result.unshift(Reflect.getMetadata(metadataKey, cur));
        cur = Object.getPrototypeOf(cur);
    }
    return result;
}
