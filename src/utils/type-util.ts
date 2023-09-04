import { toString } from './proto-fn.ts';

export function matchOf(variable: unknown): string {
    return toString.call(variable).replace(/(^\[[\W\w]+ )|(]$)/g, '');
}

export function typeOf(variable: unknown): string {
    return matchOf(variable).toLowerCase();
}

export function is(variable: unknown, sign: string): boolean {
    return toString.call(variable) === sign;
}

export function isNumber(variable: unknown): variable is number {
    return typeof variable === 'number';
}

export function isString(variable: unknown): variable is string {
    return typeof variable === 'string';
}

export function isBoolean(variable: unknown): variable is boolean {
    return typeof variable === 'boolean';
}

export function isFunction(variable: unknown): variable is Function {
    return typeof variable === 'function';
}

export function isSymbol(variable: unknown): variable is Symbol {
    return typeof variable === 'symbol';
}

export function isUndefined(variable: unknown): variable is undefined {
    return typeof variable === 'undefined';
}

const
    ObjectSign = '[object Object]',
    ArraySign = '[object Array]',
    RegExpSign = '[object RegExp]',
    DateSign = '[object Date]',
    ErrorSign = '[object Error]',
    NullSign = '[object Null]';

export function isObject(variable: unknown): variable is object {
    return is(variable, ObjectSign);
}

export function isArray(variable: unknown): variable is unknown[] {
    if (Array.isArray) {
        return Array.isArray(variable);
    }
    return is(variable, ArraySign);
}

export function isRegExp(variable: unknown): variable is RegExp {
    return is(variable, RegExpSign);
}

export function isDate(variable: unknown): variable is Date {
    return is(variable, DateSign);
}

export function isError(variable: unknown): variable is Error {
    return is(variable, ErrorSign);
}

export function isNull(variable: unknown): variable is null {
    return is(variable, NullSign);
}

/**
 * 只是一次ts的断言，没有实际作用，返回true
 */
export function assertType<T>(variable: unknown): variable is T {
    return true;
}

/**
 * 只是一次ts的断言，没有实际作用，返回true
 * @ts-ignore */
export function justType<T, V>(variable: V): variable is Exclude<V, Exclude<V, T>> {
    return true;
}
