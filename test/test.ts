import { ArrayParser } from '../src/parse/array-parser.ts';
import { Float32, Float64, Uint8 } from '../src/parse/primitive-parser.ts';
import { getStringParser } from '../src/parse/string-parser.ts';
import { getStructParser } from '../src/parse/struct-parser.ts';
import { bu64s, bu64les, u32les, u32bes } from '../src/parse/typed-array-parser.ts';
import { createContext } from '../src/parse/base-parser.ts';

type TestStruct = {
    name: string,
    age: number,
    height: number,
    money: number,
    itemType: number,
    itemCount: number,
    item: ArrayLike<number>,
}

const testStruct: Omit<TestStruct, 'itemType'> = {
    name: 'jerry',
    age: 29,
    height: 1.75,
    money: 9968.22322233,
    itemCount: 2,
    item: Uint32Array.of(0x66ccff, 0xffcc66),
};

const testStructItems1: Pick<TestStruct, 'itemType'> = {
    itemType: 1,
};

const testStructItems2: Pick<TestStruct, 'itemType'> = {
    itemType: 2,
};

const TestStructParser = getStructParser<TestStruct>({
    fields: [
        { name: 'name', type: getStringParser({ ends: true }) },
        { name: 'age', type: Uint8 },
        { name: 'height', type: Float32 },
        { name: 'money', type: Float64 },
        { name: 'itemType', type: Uint8, variable: true },
        { name: 'itemCount', type: Uint8, variable: true },
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

const TestStructListParser = new ArrayParser<TestStruct>({ item: TestStructParser, count: 2 });

const context = createContext(new ArrayBuffer(100));

const writeSpec = TestStructListParser.write(context, 0, [
    { ...testStruct, ...testStructItems1 },
    { ...testStruct, ...testStructItems2 },
]);

console.log(writeSpec.value);
// console.log(getStructSpec(writeSpec.value)?.name?.offset);
// console.log(getStructSpec(writeSpec.value)?.age?.offset);
console.log(context.buffer);


const readSpec = TestStructListParser.read(context, 0);

console.log(readSpec.value);

console.log();
