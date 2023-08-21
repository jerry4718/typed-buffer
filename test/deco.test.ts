import { FieldExpose, FieldIf, FieldType, getStructReadSnap, getStructWriteSnap, ParserTarget } from '../mod.ts';
import * as t from '../mod.ts';

@ParserTarget({ endian: 'be' })
class Person {
    @FieldType(t.String, { size: t.Uint8, coding: t.Utf8 })
    name!: string;

    @FieldType(t.Uint8)
    age!: number;

    @FieldType(t.Float32)
    height!: number;

    @FieldType(t.Float64)
    money!: number;

    @FieldType(t.Uint16)
    @FieldExpose()
    itemType!: number;

    @FieldType(t.Uint16)
    @FieldExpose()
    itemCount!: number;

    @FieldType(({ scope }: t.ParserContext) => {
        const option = { count: () => scope.itemCount as number };
        if (scope.itemType === 1) return t.Uint32Array(option);
        if (scope.itemType === 2) return t.Uint32Array(option);
        throw Error(`unknown itemType case ${scope.itemType}`);
    })
    @FieldIf(
        (_, scope) => scope.itemCount as number > 0,
        Uint32Array.of(),
    )
    item!: Uint32Array;
}

const testPerson: Omit<Person, 'itemType'> = {
    name: 'jerry',
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
console.log(writeContext.buffer.slice(...writeSpec.pos));

const readContext = t.createContext(writeContext.buffer);
const [ readData ] = readContext.read(PersonArrayParser);

console.log(getStructWriteSnap(data[0]));
console.log(getStructWriteSnap(data[1]));
console.log(getStructReadSnap(readData[0]));
console.log(getStructReadSnap(readData[1]));

Reflect.defineMetadata("name: 111", 111, [])
