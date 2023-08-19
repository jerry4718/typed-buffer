import { createContext } from '../src/context/parser-context.ts';
import { ArrayParser } from '../src/parse/array-parser.ts';
import { Float32, Float64, Uint8 } from '../src/parse/primitive-parser.ts';
import { getStringParser } from '../src/parse/string-parser.ts';
import { getStructParser } from '../src/parse/struct-parser.ts';
import { bu64s, bu64les, u32les, u32bes } from '../src/parse/typed-array-parser.ts';

type MusicInfo = {
    name: string,
    singer: string,
    album?: string,
}

type MovieInfo = {
    name: string,
    actor: string[],
}

type PersonLike = {
    music: MusicInfo[],
    movie: MovieInfo[],
}

const personLike: PersonLike = {
    music: [
        { name: '向阳花', singer: '谢天笑' },
        { name: '冷血动物', singer: '谢天笑', album: '冷血动物' },
    ],
    movie: [
        { name: 'Tom and Jerry', actor: [ 'Tom', 'Jerry' ] },
    ],
};

type PersonStruct = {
    name: string,
    age: number,
    height: number,
    money: number,
    itemType: number,
    itemCount: number,
    item: ArrayLike<number>,
}

const testStruct: Omit<PersonStruct, 'itemType'> = {
    name: 'jerry',
    age: 29,
    height: 1.75,
    money: 9968.22322233,
    itemCount: 2,
    item: Uint32Array.of(0x66ccff, 0xffcc66),
};

const testStructItems1: Pick<PersonStruct, 'itemType'> = {
    itemType: 1,
};

const testStructItems2: Pick<PersonStruct, 'itemType'> = {
    itemType: 2,
};

const TestStructParser = getStructParser<PersonStruct>({
    fields: [
        { name: 'name', type: getStringParser({ size: Uint8 }) },
        { name: 'age', type: Uint8 },
        { name: 'height', type: Float32 },
        { name: 'money', type: Float64 },
        { name: 'itemType', type: Uint8, expose: true },
        { name: 'itemCount', type: Uint8, expose: true },
        {
            name: 'item',
            type: (_, scope) => {
                const option = { count: () => scope.itemCount as number };
                switch (scope.itemType) {
                    case 1: return u32les(option);
                    case 2: return u32bes(option);
                }
                throw Error(`unknown itemType case ${scope.itemType}`);
            },
        },
    ],
});

const TestStructListParser = new ArrayParser<PersonStruct>({ item: TestStructParser, count: 2 });

const writeContext = createContext(new ArrayBuffer(100));

const writeSpec = writeContext.write(TestStructListParser, [
    { ...testStruct, ...testStructItems1 },
    { ...testStruct, ...testStructItems2 },
]);

console.log(writeSpec.value);
// console.log(getStructSpec(writeSpec.value)?.name?.offset);
// console.log(getStructSpec(writeSpec.value)?.age?.offset);
console.log(writeContext.buffer);

const readContext = createContext(writeContext.buffer);
const readSpec = readContext.read(TestStructListParser);

console.log(readSpec.value);
