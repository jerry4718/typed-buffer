import { Constructor, isExtendFrom } from '../utils/prototype-util.ts';
import { ContextOption, Parser, ParserContext } from './types.ts';

export type AdvancedParserConfig = {
    option?: Partial<ContextOption>
}

export abstract class BaseParser<T> implements Parser<T> {
    abstract read(context: ParserContext, byteOffset: number): T;

    abstract write(context: ParserContext, value: T, byteOffset: number): T;
}

export abstract class AdvancedParser<T> extends BaseParser<T> {
    public readonly option?: Partial<ContextOption>;

    protected constructor(config: AdvancedParserConfig) {
        super();
        this.option = config?.option;
    }
}

/* hack** decorator 中使用的判断标记 */
const kParserCreator = Symbol('@@ParserCreator');

export function createParserCreator<T, P extends BaseParser<T>, O>(Constructor: new (option: O) => P): (option: O) => P {
    return Object.assign((option: O) => new Constructor(option), { [kParserCreator]: true });
}

export function isParserCreator<T, O, P extends BaseParser<T>>(input: object): input is (option: O) => P {
    if (!input) return false;
    if (!(kParserCreator in input)) return false;
    return input[kParserCreator] === true;
}

export function isParserClass<T, O, P extends BaseParser<T>>(input: object): input is new (option: O) => P {
    return isExtendFrom(input, BaseParser as Constructor<P>);
}

export function isAdvancedParserClass<T, O, P extends AdvancedParser<T>>(input: object): input is new (option: O) => P {
    return isExtendFrom(input, AdvancedParser as Constructor<P>);
}
