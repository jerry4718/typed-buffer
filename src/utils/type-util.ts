export function matchOf(variable: unknown): string {
	let tag: string = Object.prototype.toString.call(variable);

	return tag.replace(/(^\[[\W\w]+ )|(]$)/g, '');
}

export function typeOf(variable: unknown): string {
	return matchOf(variable).toLowerCase();
}

export function is(variable: unknown, type: string): boolean {
	return typeOf(variable) === type;
}

export function isNumber(variable: unknown): variable is number {
	return is(variable, 'number');
}

export function isString(variable: unknown): variable is string {
	return is(variable, 'string');
}

export function isBoolean(variable: unknown): variable is boolean {
	return is(variable, 'boolean');
}

export function isObject(variable: unknown): variable is object {
	return is(variable, 'object');
}

export function isArray(variable: unknown): variable is unknown[] {
	if (Array.isArray) {
		return Array.isArray(variable);
	}
	return is(variable, 'array');
}

export function isFunction(variable: unknown): variable is Function {
	return is(variable, 'function');
}

export function isSymbol(variable: unknown): variable is Symbol {
	return is(variable, 'symbol');
}

export function isRegExp(variable: unknown): variable is RegExp {
	return is(variable, 'regexp');
}

export function isDate(variable: unknown): variable is Date {
	return is(variable, 'date');
}

export function isError(variable: unknown): variable is Error {
	return is(variable, 'error');
}

export function isUndefined(variable: unknown): variable is undefined {
	return is(variable, 'undefined');
}

export function isNull(variable: unknown): variable is null {
	return is(variable, 'null');
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
