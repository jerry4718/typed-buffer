import { isFunction, isUndefined } from '../utils/type-util.ts';

export function lazyGetter<T>(getter: () => T) {
    let value: T;
    return function () {
        if (!isUndefined(value)) return value;
        return value = getter();
    };
}

export function calcGetter<T>(hook: T | (() => T)): T {
    return isFunction(hook) ? hook() : hook;
}
