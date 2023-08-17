import { StructFields, StructParser } from "./meta.ts";
import 'reflect-metadata';

export const defineClassDecorator = (decorator: ClassDecorator): ClassDecorator => decorator;
export const definePropertyDecorator = (decorator: PropertyDecorator): PropertyDecorator => decorator;
export const defineMethodDecorator = (decorator: MethodDecorator): MethodDecorator => decorator;
export const defineParameterDecorator = (decorator: ParameterDecorator): ParameterDecorator => decorator;

export function Parser(name: string) {
	return defineClassDecorator(Reflect.metadata(StructParser, name));
}

export function Field(config: object) {
	return definePropertyDecorator(function (proto, propertyKey) {
		const fields: any[] = Reflect.hasOwnMetadata(StructFields, proto)
			? Reflect.getOwnMetadata(StructFields, proto)
			: [];

		fields.push({ name: propertyKey, slot: false, ...config });

		Reflect.defineMetadata(StructFields, fields, proto);
	});
}
