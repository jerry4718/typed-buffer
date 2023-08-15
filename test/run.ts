import { Uint8, Float32, Float64 } from '../src/parser/primitive-parser.ts';
import { getStringParser } from '../src/parser/string-parser.ts';
import { getStructParser, getStructSpec } from '../src/parser/struct-parser.ts';

type TestStruct = {
    name: string,
    age: number,
    height: number,
    money: number,
    item: BigInt64Array,
}

const testStruct: TestStruct = {
    name: 'jerry',
    age: 29,
    height: 1.75,
    money: 9968.22322233,
    item: BigInt64Array.of(1n)
};

const testStructParser = getStructParser<TestStruct>({
    fields: [
        { name: 'name', type: getStringParser({ eos: true }) },
        { name: 'age', type: Uint8 },
        { name: 'height', type: Float32 },
        { name: 'money', type: Float64 },
        { name: 'item', type: Float64 },
    ],
});


const context = {
    buffer: new Uint8Array(40).buffer,
    scope: {},
};

const writeSpec = testStructParser.write(context, 0, testStruct);

console.log(writeSpec.value);
console.log(getStructSpec(writeSpec.value)?.name?.offset);
console.log(getStructSpec(writeSpec.value)?.age?.offset);
console.log(context.buffer);


const readSpec = testStructParser.read(context, 0);

console.log(readSpec.value);

console.log()
