import { Parser, ParserContext } from './types.ts';

export abstract class BaseParser<T> implements Parser<T> {
    abstract read(parentContext: ParserContext, byteOffset: number): T;

    abstract write(parentContext: ParserContext, value: T, byteOffset: number): T;
}

export abstract class AdvancedParser<T> extends BaseParser<T> {
}
