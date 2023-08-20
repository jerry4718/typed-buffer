import * as t from '../mod.ts';

@t.ParserTarget({ endian: 'le' })
class Person {
    @t.FieldType(t.String, { size: t.Uint8, coding: t.Utf8 })
    name!: string;

    @t.FieldType(t.Uint8)
    age!: number;

    @t.FieldType(t.Float32)
    @t.FieldOption({ endian: 'be' })
    height!: number;

    @t.FieldType(t.Float64)
    @t.FieldOption({ endian: 'be' })
    money!: number;

    /** todo: 根据顶部的endian配置，这里应该读作 Uint16LE */
    @t.FieldType(t.Uint16)
    @t.FieldExpose()
    itemType!: number;

    @t.FieldType(t.Uint8)
    @t.FieldExpose()
    itemCount!: number;

    @t.FieldType((_, scope) => {
        const option = { count: () => scope.itemCount as number };
        if (scope.itemType === 1) return new t.Uint32BEArray(option);
        if (scope.itemType === 2) return new t.Uint32LEArray(option);
        throw Error(`unknown itemType case ${scope.itemType}`);
    })
    @t.FieldCondition(
        (_, scope) => scope.itemCount as number > 0,
        Uint32Array.of(),
    )
    item!: Uint32Array;
}

const testPerson: Omit<Person, 'itemType'> = {
    name: '123~~~!!!@@@我淦啊',
    age: 29,
    height: 1.75,
    money: 9968.22322233,
    itemCount: 2,
    item: Uint32Array.of(0x66ccff, 0xffcc66),
};

const data = [
    Object.assign(new Person(), { ...testPerson, itemType: 1 }),
    Object.assign(new Person(), { ...testPerson, itemType: 2 }),
];

const PersonParser = t.getTypedParser(Person);
const PersonArrayParser = new t.ArrayParser<Person>({ item: PersonParser, count: t.Uint8 });

const writeContext = t.createContext(new ArrayBuffer(100));

const writeSpec = writeContext.write(PersonArrayParser, data);

console.log(writeSpec.value);
// console.log(getStructSpec(writeSpec.value)?.name?.offset);
// console.log(getStructSpec(writeSpec.value)?.age?.offset);
console.log(writeContext.buffer.slice(...writeSpec.pos));

const readContext = t.createContext(writeContext.buffer);
const readSpec = readContext.read(PersonArrayParser);

console.log(readSpec.value);
