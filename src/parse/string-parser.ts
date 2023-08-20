// 字符串解析器
import { Uint8 } from './primitive-parser.ts';
import { AdvancedParser, BaseParserConfig } from '../context/base-parser.ts';
import { type Coding, Utf8 } from '../coding/codings.ts';
import { slice } from '../utils/proto-fn.ts';
import { ArrayParser, ArrayParserCountReader, ArrayParserConfigComputed } from './array-parser.ts';
import { ParserContext } from '../context/types.ts';

type StringParserConfig =
    & BaseParserConfig
    & Exclude<ArrayParserConfigComputed, ArrayParserCountReader>
    & { coding?: Coding }

export class StringParser extends AdvancedParser<string> {
    coding: Coding;
    dataParser: ArrayParser<number>;

    constructor(config: StringParserConfig) {
        super(config);
        const { coding = Utf8, ...computed } = config;
        this.coding = coding;
        this.dataParser = new ArrayParser({ item: Uint8, ...computed });
    }

    read(ctx: ParserContext): string {
        const [ readArray ] = ctx.read(this.dataParser);
        const byteArray = readArray instanceof Uint8Array ? readArray : Uint8Array.from(readArray);
        return this.coding.decode(byteArray);
    }

    write(ctx: ParserContext, value: string): string {
        const byteArray = this.coding.encode(value);
        ctx.write(this.dataParser, slice.call(byteArray));
        return value;
    }
}

export function getStringParser(option: StringParserConfig) {
    return new StringParser(option);
}

export {
    StringParser as String,
};
