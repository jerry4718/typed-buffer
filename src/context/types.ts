import { Coding } from '../coding/face.ts';
import { SafeAny } from '../utils/prototype-util.ts';
import { SnapTuple } from "./snap-tuple.ts";
import { BaseParser } from "./base-parser.ts";
import { TypedArrayFactory, TypedArrayInstance } from "../utils/typed-array.ts";
import { Endian } from "../utils/endianness-util.ts";

export type ScopeAccessor = Record<string | symbol | number, SafeAny>

export type ContextCompute<Result> = (ctx: ParserContext, scope: ScopeAccessor) => Result

// 可动态配置的option
export type AccessOption = {
    pos: number,
    consume: boolean,
};
// 可动态配置的option
export type ContextOption = {};

// 固定的配置，我们认定这些配置不需要在解析过程中发生改变
export type ContextConstant = {
    $path: string | symbol,
    path: string,
    ends: number,
    coding: Coding,
    /**
     * 所有数据都是基于原始数类型做的读写处理，
     * 所以endian会被最频繁的访问，
     * 所以还是将他分离到Constant中，只支持在起点和终点配置
     */
    endian: Endian,
    debug: boolean,
    DebugStruct: (new () => SafeAny)[],
};


export interface ParserContext {
    buffer: ArrayBuffer,
    view: DataView,
    constant: ContextConstant,
    /* 作用域，提供一些上下文产生的数据的访问功能 */
    scope: ScopeAccessor,

    /* context中保留着一切需要的数据，所以read，write操作最终交付给context执行 */
    $$read<T>(parser: BaseParser<T>, option?: Partial<AccessOption>): SnapTuple<T>,

    $$write<T>(parser: BaseParser<T>, value: T, option?: Partial<AccessOption>): SnapTuple<T>,

    /* context中保留着一切需要的数据，所以read，write操作最终交付给context执行 */
    read<T>(parser: BaseParser<T>, option?: Partial<AccessOption>): T,

    write<T>(parser: BaseParser<T>, value: T, option?: Partial<AccessOption>): T,

    u8View(specify: ({ size: number } | { count: number }), patchOption?: Partial<AccessOption>): Uint8Array

    readBuffer<Item extends (number | bigint), Instance extends TypedArrayInstance<Item, Instance>>(
        typedArrayFactory: TypedArrayFactory<Item, Instance>,
        specify: { endian?: Endian } & { count: number } | { size: number },
        patchOption?: Partial<AccessOption>,
    ): Instance,

    writeBuffer<Item extends (number | bigint), Instance extends TypedArrayInstance<Item, Instance>>(
        value: Instance,
        specify: { endian?: Endian },
        patchOption?: Partial<AccessOption>,
    ): Instance,

    /* 向scope中暴露变量 */
    expose(name: string | number | symbol, value: unknown): void,

    /* 将计算函数交给context进行计算 */
    compute<Result>(getter: ContextCompute<Result>): Result,

    start: number, // context开始的offset
    size: number, // context已经消费掉的size，不是固定的
    pos: number, // end并不是固定的，取到的值是start+size
    take: [ number, number ], // [start, end]
}
