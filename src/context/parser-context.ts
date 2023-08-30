import { NATIVE_ENDIANNESS } from '../utils/endianness-util.ts';
import { Ascii } from '../coding/codings.ts';
import { PrimitiveParser } from '../parse/primitive-parser.ts';
import { createAccessChain } from './access-chain.ts';
import { AdvancedParser, BaseParser } from './base-parser.ts';
import { ContextCompute, ContextConstant, ContextOption, ParserContext, ScopeAccessor } from './types.ts';
import { createResult, SnapTuple } from './snap-tuple.ts';
import pick from 'lodash-es/pick';
import omit from 'lodash-es/omit';

export * from './snap-tuple.ts';

const defaultContextConstant: ContextConstant = Object.freeze({
    $path: '$path',
    path: 'root',
    endian: NATIVE_ENDIANNESS,
    DebugStruct: [],
    ends: 0x00,
    coding: Ascii,
});

const defaultContextOption: ContextOption = Object.freeze({
    point: 0,
    consume: true,
});

// todo: closure => to class or not to class?
export function createContext(buffer: ArrayBuffer, inputOption: Partial<ContextConstant & ContextOption> = {}): ParserContext {
    const view = new DataView(buffer);

    const pickConstant = omit(inputOption, [ 'point', 'consume' ]);
    const pickOption = pick(inputOption, [ 'point', 'consume' ]);

    const rootConstant = createAccessChain(false, pickConstant, defaultContextConstant);
    const rootOption = createAccessChain(false, pickOption, defaultContextOption);

    const { $path, path: rootPath, endian: rootEndian } = rootConstant;
    const rootScope: ScopeAccessor = { [$path]: rootPath };

    function create(parent?: ParserContext, ...options: (ContextOption | undefined)[]): ParserContext {
        const context = {} as ParserContext;
        const contextScope = createAccessChain(true, parent?.scope || rootScope);
        const contextOption = createAccessChain(false, ...options, parent?.option || rootOption);

        const byteStart = contextOption.point;
        let byteSize = 0;

        function read<T>(parser: BaseParser<T>, patchOption?: Partial<ContextOption>): SnapTuple<T> {
            const readOption = createAccessChain(false, patchOption, { point: byteStart + byteSize });

            // 判断parser是否为Primitive，Primitive直接在ctx中读取，避免创建多余的subContext
            if (parser instanceof PrimitiveParser) {
                const { point, consume } = createAccessChain(false, readOption, contextOption);
                const primitiveContext = { buffer, view } as ParserContext;

                const value = parser.read(primitiveContext, point, rootEndian);

                const readSize = parser.byteSize;
                if (consume) byteSize += readSize;

                return createResult(value, point, readSize);
            }

            if (parser instanceof AdvancedParser) {
                const ctx = context.derive(readOption, parser.option);
                const value = parser.read(ctx, ctx.option.point);
                const readSize = ctx.size;
                if (ctx.option.consume) byteSize += readSize;
                return ctx.result(value, readSize);
            }

            throw Error('unknown Parser type');
        }

        function write<T>(parser: BaseParser<T>, value: T, patchOption?: Partial<ContextOption>): SnapTuple<T> {
            const writeOption = createAccessChain(false, patchOption, { point: byteStart + byteSize });
            if (parser instanceof PrimitiveParser) {
                const { point, consume } = createAccessChain(false, writeOption, contextOption);
                const primitiveContext = { buffer, view } as ParserContext;

                parser.write(primitiveContext, value, point, rootEndian);

                const writeSize = parser.byteSize;
                if (consume) byteSize += writeSize;

                return createResult(value, point, writeSize);
            }

            if (parser instanceof AdvancedParser) {
                const ctx = context.derive(writeOption, parser.option);
                parser.write(ctx, value, ctx.option.point);
                const writeSize = ctx.size;
                if (ctx.option.consume) byteSize += writeSize;
                return ctx.result(value, writeSize);
            }
            throw Error('unknown Parser type');
        }

        return Object.defineProperties(
            context as ParserContext,
            {
                buffer: { writable: false, value: buffer },
                view: { writable: false, value: view },
                constant: { writable: false, value: rootConstant },
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

    return create();
}

function compute<Result>(ctx: ParserContext, scope: ScopeAccessor, option: ContextOption, getter: ContextCompute<Result>): Result {
    return getter(ctx, scope, option);
}
