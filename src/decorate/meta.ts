import 'reflect-metadata';

type MetadataKey<T> = (string | symbol);

export const StructParser = Symbol('@@StructParser') satisfies MetadataKey<string>;
export const StructFields = Symbol('@@ParserFields') satisfies MetadataKey<{ type: string }>;

export function getInheritedMetadata<T>(klass: new () => unknown, metadataKey: MetadataKey<T>): T[] {
	const result: T[] = [];
	let cur = klass;
	const judgeRoot = Object.getPrototypeOf(Function);
	while (cur !== judgeRoot) {
		result.push(Reflect.getMetadata(metadataKey, cur));
		cur = Object.getPrototypeOf(cur);
	}
	return result;
}

export function getPrototypeMetadata<T>(klass: new () => unknown, metadataKey: MetadataKey<T>): T[] {
	const result: T[] = [];
	let cur = klass.prototype;
	while (cur.constructor !== Object) {
		result.push(Reflect.getMetadata(metadataKey, cur));
		cur = Object.getPrototypeOf(cur);
	}
	return result;
}
