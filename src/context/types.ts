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
    option: ContextOption,
    scope: ScopeAccessor,
    read<T>(parser: Parser<T>, option?: Partial<ContextOption>): ValueSnap<T>,
    write<T>(parser: Parser<T>, value: T, option?: Partial<ContextOption>): ValueSnap<T>,
    expose(condition: string | boolean | symbol, name: string | number | symbol, value: unknown): void,
    compute<Result>(getter: ContextCompute<Result>): Result,
    result<T>(value: T, size?: number): ValueSnap<T>,
    derive(...options: (Partial<ContextOption> | undefined)[]): ParserContext,
    size: number,
    take: [ number, number ],
}

export interface Parser<T> {
    read(parentContext: ParserContext, byteOffset: number): T;

    write(parentContext: ParserContext, value: T, byteOffset: number): T;
}
