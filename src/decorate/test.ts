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
    // const fields: any[] = Reflect.hasMetadata(StructFields, klass, propertyKey)
    //     ? Reflect.getMetadata(StructFields, klass, propertyKey)
    //     : [];
    // const meta = Reflect.metadata(StructFields, fields);
    // const lastIndex = fields.findLastIndex(field => field.name === propertyKey);
    // const addIndex = lastIndex !== -1 ? lastIndex : fields.length;
    //
    // const fieldConfig = { name: propertyKey, slot: false, ...config };
    // fields.splice(addIndex, 1, fieldConfig);

    return definePropertyDecorator(Reflect.metadata(StructFields, config));
}

function Field2(config: object) {
    return definePropertyDecorator(function (klass, propertyKey) {
        const fields: any[] = Reflect.hasOwnMetadata(StructFields, klass)
            ? Reflect.getOwnMetadata(StructFields, klass)
            : [];

        fields.push({ name: propertyKey, slot: false, ...config });

        Reflect.defineMetadata(StructFields, fields, klass);
    });
}

@Parser('Test')
class Test {
    /*@Field({ a: 1 }) */@Field2({ a: 1 }) name?: string;
    /*@Field({ a: 2 }) */@Field2({ a: 2 }) age?: number;
}

@Parser('Test2')
class Test2 extends Test {
    // @ts-ignore
    /*@Field({ a: 11 }) */@Field2({ a: 11 }) name?: string;
    // @ts-ignore
    /*@Field({ a: 12 }) */@Field2({ a: 12 }) age?: number;
}

console.log({ ['Test:MetadataKeys']: Reflect.getMetadataKeys(Test), ['Test@@StructParser']: Reflect.getMetadata(StructParser, Test) });
console.log({ ['Test2:MetadataKeys']: Reflect.getMetadataKeys(Test2), ['Test2@@StructParser']: Reflect.getMetadata(StructParser, Test2) });

const test = Reflect.construct(Test, []);
const test2 = Reflect.construct(Test2, []);

console.log({ ['test:MetadataKeys']: Reflect.getMetadataKeys(test), ['test@@StructFields']: Reflect.getMetadata(StructFields, test) });
console.log({ ['test2:MetadataKeys']: Reflect.getMetadataKeys(test2), ['test2@@StructFields']: Reflect.getMetadata(StructFields, test2) });
