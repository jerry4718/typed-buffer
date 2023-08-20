import { ContextOption, Parser, ParserContext } from './types.ts';

export type BaseParserConfig = {
    option?: Partial<ContextOption>
}

export abstract class BaseParser<T> implements Parser<T> {
    public readonly option: Readonly<Partial<ContextOption>>;

    constructor(config: BaseParserConfig) {
        const option = config?.option;
        this.option = Object.freeze(Object.assign({}, option));
    }

    abstract read(context: ParserContext, byteOffset: number): T;

    abstract write(context: ParserContext, value: T, byteOffset: number): T;
}

export abstract class AdvancedParser<T> extends BaseParser<T> {
}
