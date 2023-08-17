import { Field, Parser } from './decorator.ts';
import { StructFields, StructParser, getInheritedMetadata, getPrototypeMetadata } from './meta.ts';
import 'reflect-metadata';

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

console.log({
	'Test2::ClassMetadata@@StructParser': getInheritedMetadata(Test2, StructParser),
	'Test2::FieldMetadata@@StructFields': getPrototypeMetadata(Test2, StructFields),
});
