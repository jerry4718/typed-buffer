import { FieldExpose, FieldIf, FieldType, getStructReadSnap, getStructWriteSnap, StructTarget } from '../mod.ts';
import * as t from '../mod.ts';

@StructTarget({ endian: 'be' })
class Person {
    @FieldType(t.String, { size: t.Uint8, coding: t.Utf8 })
    name!: string;

    @FieldType(t.Uint8)
    age!: number;

    @FieldType(t.Float32)
    height!: number;

    @FieldType(t.Float32)
    money!: number;

    @FieldType(t.Uint16)
    @FieldExpose()
    itemType!: number;

    @FieldType(t.Uint16)
    @FieldExpose()
    itemCount!: number;

    @FieldType(({ scope }: t.ParserContext) => {
        const option = { count: () => scope.itemCount as number };
        if (scope.itemType === 1) return t.Uint32LEArray(option);
        if (scope.itemType === 2) return t.Uint32BEArray(option);
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

const PersonParser = t.getTargetParser(Person);
const PersonArrayParser = new t.ArrayParser<Person>({ item: PersonParser, count: t.Uint8 });

const writeContext = t.createContext(new ArrayBuffer(100));

const writeRes = writeContext.write(PersonArrayParser, data);

console.log(writeRes);
console.log(writeContext.buffer.slice(writeContext.start, writeContext.end));

const readContext = t.createContext(writeContext.buffer);
const readData = readContext.read(PersonArrayParser);

console.log(getStructWriteSnap(data[0]));
console.log(getStructWriteSnap(data[1]));
console.log(getStructReadSnap(readData[0]));
console.log(getStructReadSnap(readData[1]));
