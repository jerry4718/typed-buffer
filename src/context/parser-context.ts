import { Ascii } from '../coding/codings.ts';
import { Endian } from '../common.ts';
import { PrimitiveParser } from '../parse/primitive-parser.ts';
import { createAccessChain } from './access-chain.ts';
import { BaseParser } from './base-parser.ts';
import { ContextCompute, ContextOption, ParserContext, ScopeAccessor } from './types.ts';
import { createResult, SnapTuple } from './snap-tuple.ts';

export * from './snap-tuple.ts';

// 探测当前运行环境的端序情况
function nativeEndianness(): Endian {
    const testBuffer = new ArrayBuffer(2);
    new Uint16Array(testBuffer).fill(0x0102);
    const [ left, right ] = new Uint8Array(testBuffer);
    if (left === 1 && right === 2) return 'be';
    if (left === 2 && right === 1) return 'le';
    throw Error('never');
}

const defaultContextOption: ContextOption = {
    point: 0,
    consume: true,
    ends: 0x00,
    endian: nativeEndianness(),
    coding: Ascii,
    DebugStruct: [],
};

// todo: closure => to class or not to class?
export function createContext(buffer: ArrayBuffer, option: Partial<ContextOption> = {}): ParserContext {
    const rootOption = createAccessChain(false, option, defaultContextOption);
    const view = new DataView(buffer);

    function create(parent?: ParserContext, ...options: (ContextOption | undefined)[]): ParserContext {
        const context = {} as ParserContext;
        const contextScope = createAccessChain(true, parent?.scope);
        const contextOption = createAccessChain(false, ...options, parent?.option, rootOption);

        if (!parent) contextScope.$path = '';

        const byteStart = contextOption.point!;
        let byteSize = 0;

        function read<T>(parser: BaseParser<T>, patchOption?: Partial<ContextOption>): SnapTuple<T> {
            const readOption = createAccessChain(false, patchOption, parser.option, { point: byteStart + byteSize });
            // 判断parser是否为Primitive，Primitive直接在ctx中读取，避免创建多余的subContext
            if (parser instanceof PrimitiveParser) {
                const { point, consume, endian } = createAccessChain(false, readOption, contextOption);
                const primitiveContext = { buffer, view, option: { endian } } as ParserContext;

                const value = parser.read(primitiveContext, point);

                const readSize = parser.byteSize;
                if (consume) byteSize += readSize;

                return createResult(value, point, readSize);
            }

            const ctx = context.derive(readOption);
            const value = parser.read(ctx, ctx.option.point);
            const readSize = ctx.size;
            if (ctx.option.consume) byteSize += readSize;
            return ctx.result(value, readSize);
        }

        function write<T>(parser: BaseParser<T>, value: T, patchOption?: ContextOption): SnapTuple<T> {
            const writeOption = createAccessChain(false, patchOption, parser.option, { point: byteStart + byteSize });
            if (parser instanceof PrimitiveParser) {
                const { point, consume, endian } = createAccessChain(false, writeOption, contextOption);
                const primitiveContext = { buffer, view, option: { endian } } as ParserContext;

                parser.write(primitiveContext, value, point);

                const writeSize = parser.byteSize;
                if (consume) byteSize += writeSize;

                return createResult(value, point, writeSize);
            }

            const ctx = context.derive(writeOption);
            parser.write(ctx, value, ctx.option.point);
            const writeSize = ctx.size;
            if (ctx.option.consume) byteSize += writeSize;
            return ctx.result(value, writeSize);
        }

        return Object.defineProperties(
            context as ParserContext,
            {
                buffer: { writable: false, value: buffer },
                view: { writable: false, value: view },
                option: { writable: false, value: contextOption },
                scope: { writable: false, value: contextScope },
                read: { writable: false, value: read },
                write: { writable: false, value: write },
                expose: { writable: false, value: Reflect.set.bind(void 0, contextScope) },
                compute: { writable: false, value: compute.bind(void 0, context, contextScope, contextOption) },
                result: { writable: false, value: <T>(value: T, size = byteSize): SnapTuple<T> => createResult(value, contextOption.point, size) },
                derive: { writable: false, value: create.bind(void 0, context) },
                start: { writable: false, value: byteStart },
                size: { get: () => byteSize },
                end: { get: () => byteStart + byteSize },
                take: { get: () => [ byteStart, byteStart + byteSize ] },
            },
        );
    }

    return create(void 0);
}

function compute<Result>(ctx: ParserContext, scope: ScopeAccessor, option: ContextOption, getter: ContextCompute<Result>): Result {
    return getter(ctx, scope, option);
}
