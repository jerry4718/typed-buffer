// 字符串解析器
import { Uint8 } from './primitive-parser.ts';
import { AdvancedParser, ParserContext, ParserOptionComposable, ValueDesc } from './base-parser.ts';
import { type Coding, Utf8 } from '../coding/codings.ts';
import { slice } from '../utils/proto-fn.ts';
import { ArrayParserReaderComputed, ArrayParserCountReader, ArrayParser } from './array-parser.ts';

type StringParserOption =
    & Exclude<ArrayParserReaderComputed<number>, ArrayParserCountReader<number>>
    & { coding?: Coding }

export class StringParser extends AdvancedParser<string> {
    coding: Coding;
    dataParser: ArrayParser<number>;

    constructor(option: StringParserOption) {
        super();
        const { coding = Utf8, ...computed } = option;
        this.coding = coding;
        this.dataParser = new ArrayParser({ item: Uint8, ...computed });
    }

    read(ctx: ParserContext<unknown>, byteOffset: number, option?: ParserOptionComposable): ValueDesc<string> {
        const [ readArray, { size: byteSize } ] = this.dataParser.read(ctx, byteOffset, option);
        const byteArray = readArray instanceof Uint8Array ? readArray : Uint8Array.from(readArray);
        const value = this.coding.decode(byteArray);
        return this.valueDesc(value, byteOffset, byteSize);
    }

    write(parentContext: ParserContext<unknown>, byteOffset: number, value: string, option?: ParserOptionComposable): ValueDesc<string> {
        const byteArray = this.coding.encode(value);
        const [ _, { size: byteSize } ] = this.dataParser.write(parentContext, byteOffset, slice.call(byteArray), option);
        return this.valueDesc(value, byteOffset, byteSize);
    }
}

export function getStringParser(option: StringParserOption) {
    return new StringParser(option);
}
