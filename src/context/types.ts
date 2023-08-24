import { Endian } from '../common.ts';
import { SnapTuple } from './parser-context.ts';
import { Coding } from '../coding/face.ts';
import { SafeAny } from '../utils/prototype-util.ts';

export type ScopeAccessor = Record<string | symbol | number, SafeAny>

export type ContextCompute<Result> = (ctx: ParserContext, scope: ScopeAccessor, option: ContextOption) => Result

export type ContextOption = {
    point: number, // fixed, cannot computable
    consume: boolean,
    ends: number,
    endian: Endian,
    coding: Coding,
    DebugStruct: (new () => SafeAny)[],
};

export type ParserContext = {
    buffer: ArrayBuffer,
    view: DataView,
    option: Required<ContextOption>,
    scope: ScopeAccessor,
    read<T>(parser: Parser<T>, option?: Partial<ContextOption>): SnapTuple<T>,
    write<T>(parser: Parser<T>, value: T, option?: Partial<ContextOption>): SnapTuple<T>,
    expose(name: string | number | symbol, value: unknown): void,
    compute<Result>(getter: ContextCompute<Result>): Result,
    result<T>(value: T, size?: number): SnapTuple<T>,
    derive(...options: (Partial<ContextOption> | undefined)[]): ParserContext,
    start: number,
    size: number,
    end: number,
    take: [ number, number ],
}

export interface Parser<T> {
    read(parentContext: ParserContext, byteOffset: number): T;

    write(parentContext: ParserContext, value: T, byteOffset: number): T;
}
