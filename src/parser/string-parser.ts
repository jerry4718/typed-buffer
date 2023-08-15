// 字符串解析器
import { Uint8 } from './primitive-parser.ts';
import { AdvancedParser, ParserContext, ParserOptionComposable, ValueSpec } from './base-parser.ts';
import { Encoding, Encodings } from '../utils/encoding/index.ts';
import { slice } from '../utils/proto-fn.ts';
import { ArrayParserReaderComputed, ArrayParserCountReader, getArrayParser, ArrayParser } from './array-parser.ts';

type StringParserOption =
    & Exclude<ArrayParserReaderComputed<number>, ArrayParserCountReader<number>>
    & { encoding?: Encoding }

export class StringParser extends AdvancedParser<string> {
    encoding: Encoding;
    dataParser: ArrayParser<number>;

    constructor(option: StringParserOption) {
        super();
        const { encoding = Encodings.Ascii, ...computed } = option;
        this.encoding = encoding;
        this.dataParser = getArrayParser({ item: Uint8, ...computed });
    }

    read(ctx: ParserContext<unknown>, byteOffset: number, option?: ParserOptionComposable): ValueSpec<string> {
        const { value: readArray, byteSize } = this.dataParser.read(ctx, byteOffset, option);
        const byteArray = readArray instanceof Uint8Array ? readArray : Uint8Array.from(readArray);
        const value = this.encoding.decode(byteArray);
        return this.valueSpec(value, byteOffset, byteSize);
    }

    write(parentContext: ParserContext<unknown>, byteOffset: number, value: string, option?: ParserOptionComposable): ValueSpec<string> {
        const byteArray = this.encoding.encode(value);
        const { byteSize } = this.dataParser.write(parentContext, byteOffset, slice.call(byteArray), option);
        return this.valueSpec(value, byteOffset, byteSize);
    }
}

export function getStringParser(option: StringParserOption) {
    return new StringParser(option);
}
