import { StructFields, StructParser } from './meta.ts';
import 'reflect-metadata';

function def() {
	console.log(arguments);
}

const defineClassDecorator = (decorator: ClassDecorator): ClassDecorator => decorator;
const definePropertyDecorator = (decorator: PropertyDecorator): PropertyDecorator => decorator;
const defineMethodDecorator = (decorator: MethodDecorator): MethodDecorator => decorator;
const defineParameterDecorator = (decorator: ParameterDecorator): ParameterDecorator => decorator;

function Parser(name: string) {
	return defineClassDecorator(Reflect.metadata(StructParser, name));
}

function Field(config: object) {
	return definePropertyDecorator(function (proto, propertyKey) {
		const fields: any[] = Reflect.hasOwnMetadata(StructFields, proto)
			? Reflect.getOwnMetadata(StructFields, proto)
			: [];

		fields.push({ name: propertyKey, slot: false, ...config });

		Reflect.defineMetadata(StructFields, fields, proto);
	});
}

@Parser('Test')
class Test {
	@Field({ a: 1 }) name?: string;
	@Field({ a: 2 }) age?: number;
}

@Parser('Test2')
class Test2 extends Test {
	@Field({ a: 11 }) declare name?: string;
	@Field({ a: 12 }) declare age?: number;

	constructor() {
		super();
	}
}

function getClassMetadata<T>(klass: new () => T, metadataKey: string | symbol) {
	const result = [];
	let cur = klass;
    const judgeRoot = Object.getPrototypeOf(Function)
	while (cur !== judgeRoot) {
		result.push(Reflect.getMetadata(metadataKey, cur));
		cur = Object.getPrototypeOf(cur);
	}
	return result;
}

function getProtoMetadata<T>(klass: new () => T, metadataKey: string | symbol) {
	const result = [];
	let cur = klass.prototype;
	while (cur.constructor !== Object) {
		result.push(Reflect.getMetadata(metadataKey, cur));
		cur = Object.getPrototypeOf(cur);
	}
	return result;
}

console.log({
	'Test2::ClassMetadata@@StructParser': getClassMetadata(Test2, StructParser),
	'Test2::FieldMetadata@@StructFields': getProtoMetadata(Test2, StructFields),
});
