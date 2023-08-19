import { Endian } from '../common.ts';
import { ValueSnap } from './parser-context.ts';

export type ScopeAccessor =
    & object
    & { [k in string]: unknown }
    & { [k in symbol]: unknown }
    & { [k in number]: unknown }

export type ContextCompute<Result> = (ctx: ParserContext, scope: ScopeAccessor) => Result

export type ContextOption = {
    offset: number,
    consume: boolean,
    ends: number,
    endian: Endian,
};

export type ParserContext = {
    buffer: ArrayBuffer,
    size: number,
    take: [ number, number ],
    scope: ScopeAccessor,
    option: ContextOption,
    expose(condition: string | boolean | symbol, name: string | number | symbol, value: unknown): void,
    read<T>(parser: Parser<T>, option?: Partial<ContextOption>): ValueSnap<T>,
    write<T>(parser: Parser<T>, value: T, option?: Partial<ContextOption>): ValueSnap<T>,
    compute<Result>(getter: ContextCompute<Result>): Result,
    result<T>(value: T, size?: number): ValueSnap<T>,
    derive(option?: Partial<ContextOption>): ParserContext,
}

export interface Parser<T> {
    read(parentContext: ParserContext, byteOffset: number): T;

    write(parentContext: ParserContext, value: T, byteOffset: number): T;
}
