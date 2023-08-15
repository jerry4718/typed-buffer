import { PrimitiveParser } from './primitive-parser.ts';
import { ParserContext, AdvancedParser, ParserOptionComposable, ValueSpec } from './base-parser.ts';

export type RepeatParserOptionNumber<T> = ((ctx: ParserContext<T>) => number) | PrimitiveParser<number> | number;
export type RepeatParserOptionEos<T> = ((ctx: ParserContext<T>) => number) | number | boolean;// 支持：1.指定结束于固定数字或者 2.根据下一个unit8判断

export type RepeatParserCountReader<T> = { count: RepeatParserOptionNumber<T> };
export type RepeatParserSizeReader<T> = { size: RepeatParserOptionNumber<T> };
export type RepeatParserEosReader<T> = { eos: RepeatParserOptionEos<T> };

export type RepeatParserReaderPartial<T> = Partial<RepeatParserCountReader<T>> & Partial<RepeatParserSizeReader<T>> & Partial<RepeatParserEosReader<T>>;
export type RepeatParserReaderComputed<T> = RepeatParserCountReader<T> | RepeatParserSizeReader<T> | RepeatParserEosReader<T>;

// export class BaseRepeatParser<T> extends AdvancedParser<T> {
//     read(parentContext: ParserContext<unknown>, byteOffset: number, option?: ParserOptionComposable): ValueSpec<T> {
//         return undefined;
//     }
//
//     write(parentContext: ParserContext<unknown>, byteOffset: number, value: T, option?: ParserOptionComposable): ValueSpec<T> {
//         return undefined;
//     }
// }
