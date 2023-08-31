import omit from 'lodash-es/omit';
import pick from 'lodash-es/pick';
import { Ascii } from '../coding/codings.ts';
import { PrimitiveParser } from '../parse/primitive-parser.ts';
import { NATIVE_ENDIANNESS } from '../utils/endianness-util.ts';
import { createAccessChain } from './access-chain.ts';
import { AdvancedParser } from './base-parser.ts';
import { createResult, SnapTuple } from './snap-tuple.ts';
import { ContextCompute, ContextConstant, ContextOption, Parser, ParserContext as IParserContext, ScopeAccessor } from './types.ts';

export * from './snap-tuple.ts';

const defaultContextConstant: ContextConstant = Object.freeze({
    $path: '$path',
    path: 'root',
    endian: NATIVE_ENDIANNESS,
    ends: 0x00,
    coding: Ascii,
    debug: false,
    DebugStruct: [],
});

const defaultContextOption: ContextOption = Object.freeze({
    point: 0,
    consume: true,
});

export function createContext(buffer: ArrayBuffer, inputOption: Partial<ContextConstant & ContextOption> = {}) {
    const view = new DataView(buffer);

    const rootConstant: ContextConstant = { ...defaultContextConstant, ...omit(inputOption, [ 'point', 'consume' ]) };
    const { $path, path: rootPath, endian: rootEndian } = rootConstant;

    const rootScope: ScopeAccessor = { [$path]: rootPath };
    const rootOption: ContextOption = { ...defaultContextOption, ...pick(inputOption, [ 'point', 'consume' ]) };

    class ParserContext implements IParserContext {
        get buffer() {
            return buffer;
        }

        get view() {
            return view;
        }

        get constant() {
            return rootConstant;
        }

        option: Required<ContextOption>;
        scope: ScopeAccessor;
        start: number;
        size: number;

        constructor(parent?: IParserContext, ...options: (ContextOption | undefined)[]) {
            this.scope = createAccessChain(true, parent?.scope || rootScope);
            const contextOption = createAccessChain(false, ...options, parent?.option || rootOption);
            this.option = contextOption;
            this.start = contextOption.point;
            this.size = 0;
        }

        get end() {
            return this.start + this.size;
        }

        get take() {
            return [ this.start, this.end ] as [ number, number ];
        }

        read<T>(parser: Parser<T>, patchOption?: Partial<ContextOption>): SnapTuple<T> {
            const readOption = createAccessChain(false, patchOption, { point: this.start + this.size });

            // 判断parser是否为Primitive，Primitive直接在ctx中读取，避免创建多余的subContext
            if (parser instanceof PrimitiveParser) {
                const { point, consume } = createAccessChain(false, readOption, this.option);
                const primitiveContext = { buffer, view } as IParserContext;

                const value = parser.read(primitiveContext, point, rootEndian);

                const readSize = parser.byteSize;
                if (consume) this.size += readSize;

                return createResult(value, point, readSize);
            }

            if (parser instanceof AdvancedParser) {
                const ctx = this.derive(readOption, parser.option);
                const readPoint = ctx.option.point;
                const value = parser.read(ctx, readPoint);
                const readSize = ctx.size;
                if (ctx.option.consume) this.size += readSize;
                return ctx.result(value, readSize);
            }

            throw Error('unknown Parser type');
        }

        $read<T>(parser: Parser<T>, patchOption?: Partial<ContextOption>): T {
            const readOption = createAccessChain(false, patchOption, { point: this.start + this.size });

            // 判断parser是否为Primitive，Primitive直接在ctx中读取，避免创建多余的subContext
            if (parser instanceof PrimitiveParser) {
                const { point, consume } = createAccessChain(false, readOption, this.option);
                const primitiveContext = { buffer, view } as IParserContext;

                const value = parser.read(primitiveContext, point, rootEndian);

                const readSize = parser.byteSize;
                if (consume) this.size += readSize;

                return value;
            }

            if (parser instanceof AdvancedParser) {
                const ctx = this.derive(readOption, parser.option);
                const readPoint = ctx.option.point;
                const value = parser.read(ctx, readPoint);
                const readSize = ctx.size;
                if (ctx.option.consume) this.size += readSize;
                return value;
            }

            throw Error('unknown Parser type');
        }

        write<T>(parser: Parser<T>, value: T, patchOption?: Partial<ContextOption>): SnapTuple<T> {
            const writeOption = createAccessChain(false, patchOption, { point: this.start + this.size });
            if (parser instanceof PrimitiveParser) {
                const { point, consume } = createAccessChain(false, writeOption, this.option);
                const primitiveContext = { buffer, view } as IParserContext;

                parser.write(primitiveContext, value, point, rootEndian);

                const writeSize = parser.byteSize;
                if (consume) this.size += writeSize;

                return createResult(value, point, writeSize);
            }

            if (parser instanceof AdvancedParser) {
                const ctx = this.derive(writeOption, parser.option);
                parser.write(ctx, value, ctx.option.point);
                const writeSize = ctx.size;
                if (ctx.option.consume) this.size += writeSize;
                return ctx.result(value, writeSize);
            }

            throw Error('unknown Parser type');
        }

        $write<T>(parser: Parser<T>, value: T, option?: Partial<ContextOption>): T {
            throw Error('Unimplemented !!!');
        }

        skip(size: number): void {
            this.size += size;
        }

        result<T>(value: T, size: number = this.size): SnapTuple<T> {
            return createResult(value, this.start, size);
        }

        compute<Result>(getter: ContextCompute<Result>): Result {
            return getter(this, this.scope);
        }

        expose(name: string | number | symbol, value: unknown): void {
            Reflect.set(this.scope, name, value);
        }

        derive(...options: (Partial<ContextOption> | undefined)[]): ParserContext {
            return new ParserContext(this, ...(options as ContextOption[]));
        }
    }

    return new ParserContext(void 0);
}
