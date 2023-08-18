import { PrimitiveParser } from './primitive-parser.ts';
import { ParserContext, AdvancedParser, ParserOptionComposable, WithValue, BaseParser } from './base-parser.ts';

export type RepeatParserNumberOption<T> = ((ctx: ParserContext) => number) | PrimitiveParser<number> | number;

// export type RepeatParserJudgeSpec<T> = [ T, BaseParser<T>, (read: T, compare: T) => boolean ]
/**
 * 支持：
 *  1.指定结束于固定unit8
 *  2.根据下一个unit8判断
 */
export type RepeatParserJudgeOption<T> = ((ctx: ParserContext) => boolean) | boolean | number;

export type RepeatParserCountCompose<T> = { count: RepeatParserNumberOption<T> };
export type RepeatParserSizeCompose<T> = { size: RepeatParserNumberOption<T> };
export type RepeatParserEndsCompose<T> = { ends: RepeatParserJudgeOption<T>, include?: boolean, consume?: boolean };
export type RepeatParserEosCompose = { eos: boolean };

export type RepeatParserComposedOption<T> =
    | RepeatParserCountCompose<T>
    | RepeatParserSizeCompose<T>
    | RepeatParserEndsCompose<T>
    | RepeatParserEosCompose;

export type RepeatParserPartialOption<T> =
    & Partial<RepeatParserCountCompose<T>>
    & Partial<RepeatParserSizeCompose<T>>
    & Partial<RepeatParserEndsCompose<T>>
    & Partial<RepeatParserEosCompose>;

// export class BaseRepeatParser<T> extends AdvancedParser<T> {
//     read(parentContext: ParserContext, byteOffset: number, option?: ParserOptionComposable): ValueSpec<T> {
//         return undefined;
//     }
//
//     write(parentContext: ParserContext, byteOffset: number, value: T, option?: ParserOptionComposable): ValueSpec<T> {
//         return undefined;
//     }
// }
