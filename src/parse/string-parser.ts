// 字符串解析器
import { type Coding, Utf8 } from '../coding/codings.ts';
import { AdvancedParser, AdvancedParserConfig, createParserCreator } from '../context/base-parser.ts';
import { ParserContext } from '../context/types.ts';
import { TypedArrayConfigLoopCount, TypedArrayParser, TypedArrayParserConfigComputed, Uint8ArrayParserCreator } from './typed-array-parser.ts';

type StringParserConfig =
    & AdvancedParserConfig
    & Exclude<TypedArrayParserConfigComputed<number>, TypedArrayConfigLoopCount>
    & { coding?: Coding }

export class StringParser extends AdvancedParser<string> {
    coding: Coding;
    dataParser: TypedArrayParser<number, Uint8Array>;

    constructor(config: StringParserConfig) {
        super(config);
        const { coding = Utf8, ...computed } = config;
        this.coding = coding;
        this.dataParser = Uint8ArrayParserCreator(computed);
    }

    read(ctx: ParserContext): string {
        const readArray = this.dataParser.read(ctx);
        return this.coding.decode(readArray);
    }

    write(ctx: ParserContext, value: string): string {
        const byteArray = this.coding.encode(value);
        this.dataParser.write(ctx, byteArray);
        return value;
    }
}

const StringParserCreator = createParserCreator(StringParser);

export {
    StringParserCreator,
    StringParserCreator as String,
    StringParserCreator as string,
};
