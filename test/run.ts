import { getArrayParser, BigUint64BEArray as BigUint64BEArrayParser } from '../src/parser/array-parser.ts';
import { Uint8, Float32, Float64 } from '../src/parser/primitive-parser.ts';
import { getStringParser } from '../src/parser/string-parser.ts';
import { getStructParser } from '../src/parser/struct-parser.ts';
import { BigUint64Array } from '../src/describe/interface.ts';

type TestStruct = {
	name: string,
	age: number,
	height: number,
	money: number,
	itemCount: number,
	item: BigUint64Array,
}

const testStruct: TestStruct = {
	name: 'jerry',
	age: 29,
	height: 1.75,
	money: 9968.22322233,
	itemCount: 2,
	item: BigUint64Array.of(13162318506_000000n, 18516739416_000000n),
};

const TestStructParser = getStructParser<TestStruct>({
	fields: [
		{ name: 'name', type: getStringParser({ ends: true }) },
		{ name: 'age', type: Uint8 },
		{ name: 'height', type: Float32 },
		{ name: 'money', type: Float64 },
		{ name: 'itemCount', type: Uint8, variable: true },
		{ name: 'item', type: BigUint64BEArrayParser({ count: (ctx) => Number(ctx.scope.itemCount) || 0 }) },
	],
});

const TestStructListParser = getArrayParser<TestStruct>({ item: TestStructParser, count: 2 });

const context = {
	buffer: new Uint8Array(80).buffer,
	scope: {},
};

const writeSpec = TestStructListParser.write(context, 0, [ testStruct, testStruct ]);

console.log(writeSpec.value);
// console.log(getStructSpec(writeSpec.value)?.name?.offset);
// console.log(getStructSpec(writeSpec.value)?.age?.offset);
console.log(context.buffer);


const readSpec = TestStructListParser.read(context, 0);

console.log(readSpec.value);

console.log();
