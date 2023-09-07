import { Ascii } from '../coding/codings.ts';
import { BufferParser } from '../parse/buffer-parser.ts';
import { PrimitiveParser } from '../parse/primitive-parser.ts';
import { changeTypedArrayEndianness, Endian, NATIVE_ENDIANNESS } from '../utils/endianness-util.ts';
import { createAccessChain, optionChain, scopeChain } from './access-chain.ts';
import { AdvancedParser, BaseParser } from './base-parser.ts';
import { createResult, SnapTuple } from './snap-tuple.ts';
import { ContextCompute, ContextConstant, ContextOption, ParserContext, ScopeAccessor } from './types.ts';
import { TypedArrayFactory, TypedArrayInstance } from "../utils/typed-array.ts";
import { isNumber, isUndefined } from "../utils/type-util.ts";

export * from './snap-tuple.ts';
export * from './access-chain.ts';

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

    const constant: ContextConstant = { ...defaultContextConstant, ...inputOption };
    const { $path, path: rootPath, endian: rootEndian } = constant;

    const rootScope: ScopeAccessor = { [$path]: rootPath };
    const rootOption: ContextOption = { ...defaultContextOption, ...inputOption };

    class ParserContextImpl implements ParserContext {
        get buffer() {
            return buffer;
        }

        get view() {
            return view;
        }

        get constant() {
            return constant;
        }

        option: Required<ContextOption>;
        scope: ScopeAccessor;
        start: number;
        size: number;

        constructor(contextOption: ContextOption = rootOption) {
            this.scope = scopeChain(rootScope);
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

        u8View(specify: ({ size: number } | { count: number }), patchOption?: Partial<ContextOption>): Uint8Array {
            const { size: specSize, count: specCount } = specify as { count: number, size: number };

            if (isUndefined(specSize) && isUndefined(specCount)) {
                throw Error('Either `count` or `size` must be specified when calling `bufferView`');
            }

            const viewSize = isNumber(specSize) ? specSize : specCount;

            const { point, consume } = createAccessChain(false, patchOption, { point: this.start + this.size }, this.option);

            if (consume) this.size += viewSize;
            return new Uint8Array(this.buffer, point, viewSize);
        }

        bufferRead<Item extends number | bigint, Instance extends TypedArrayInstance<Item, Instance>>(
            typedArrayFactory: TypedArrayFactory<Item, Instance>,
            specify: { endian?: Endian } & ({ size: number } | { count: number }),
            patchOption?: Partial<ContextOption>,
        ): Instance {
            const { size: specSize, count: specCount } = specify as { count: number, size: number };

            if (isUndefined(specSize) && isUndefined(specCount)) {
                throw Error('Either `count` or `size` must be specified when calling `bufferRead`');
            }

            const bytesPerElement = typedArrayFactory.BYTES_PER_ELEMENT;
            const readSize = isNumber(specSize) ? specSize : (specCount * bytesPerElement);

            const { point, consume } = createAccessChain(false, patchOption, { point: this.start + this.size }, this.option);

            const copyBuffer = this.buffer.slice(point, point + readSize);

            const result = Reflect.construct(typedArrayFactory, [ copyBuffer ]);
            if (consume) this.size += readSize;

            const selectedEndian = specify.endian || rootEndian;
            return selectedEndian === NATIVE_ENDIANNESS ? result : changeTypedArrayEndianness(result);
        }

        bufferWrite<Item extends number | bigint, Instance extends TypedArrayInstance<Item, Instance>>(
            value: Instance,
            specify: { endian?: Endian },
            patchOption?: Partial<ContextOption>,
        ): Instance {
            const selectedEndian = specify.endian || rootEndian;
            const writeValue = selectedEndian === NATIVE_ENDIANNESS ? value : changeTypedArrayEndianness(value);

            const { point, consume } = createAccessChain(false, patchOption, { point: this.start + this.size }, this.option);

            const writeSize = writeValue.byteLength;

            new Uint8Array(this.buffer).set(new Uint8Array(writeValue.buffer), point);

            if (consume) this.size += writeSize;
            return value;
        }

        $$read<T>(parser: BaseParser<T>, patchOption?: Partial<ContextOption>): SnapTuple<T> {
            const start = this.start;
            const prevSize = this.size;
            const value = this.read(parser, patchOption);
            return createResult(value, start + prevSize, this.size - prevSize);
        }

        read<T>(parser: BaseParser<T>, patchOption?: Partial<ContextOption>): T {
            const readOption = optionChain(patchOption, { point: this.start + this.size }, this.option);

            const { point, consume } = readOption;

            // 判断parser是否为Primitive，Primitive直接在ctx中读取，避免创建多余的subContext
            if (parser instanceof PrimitiveParser) {
                const primitiveContext = { buffer, view } as ParserContext;

                const value = parser.read(primitiveContext, point, rootEndian);

                if (consume) this.size += parser.bytesPerData;

                return value;
            }

            if (parser instanceof BufferParser) {
                const primitiveContext = { buffer, constant } as ParserContext;

                const value = parser.read(primitiveContext, point);

                if (consume) this.size += parser.structBufferSize;

                return value;
            }

            if (parser instanceof AdvancedParser) {
                const beforeSize = this.size;
                this.scope = scopeChain(this.scope);
                const value = parser.read(this, point);
                if (!consume) this.size = beforeSize;
                this.scope = Object.getPrototypeOf(this.scope);
                return value;
            }

            throw Error('unknown Parser type');
        }

        $$write<T>(parser: BaseParser<T>, value: T, patchOption?: Partial<ContextOption>): SnapTuple<T> {
            const start = this.start;
            const prevSize = this.size;
            this.write(parser, value, patchOption);
            return createResult(value, start + prevSize, this.size - prevSize);
        }

        write<T>(parser: BaseParser<T>, value: T, patchOption?: Partial<ContextOption>): T {
            const writeOption = optionChain(patchOption, { point: this.start + this.size }, this.option);
            const { point, consume } = writeOption;
            if (parser instanceof PrimitiveParser) {
                const primitiveContext = { buffer, view } as ParserContext;

                parser.write(primitiveContext, value, point, rootEndian);

                const writeSize = parser.bytesPerData;
                if (consume) this.size += writeSize;

                return value;
            }

            if (parser instanceof AdvancedParser) {
                const beforeSize = this.size;
                this.scope = scopeChain(this.scope);
                parser.write(this, value, point);
                if (!consume) this.size = beforeSize;
                this.scope = Object.getPrototypeOf(this.scope);
                return value;
            }

            throw Error('unknown Parser type');
        }

        skip(size: number): void {
            this.size += size;
        }

        compute<Result>(getter: ContextCompute<Result>): Result {
            createContext.ct.compute ++;
            return getter(this, this.scope);
        }

        expose(name: string | number | symbol, value: unknown): void {
            createContext.ct.expose ++;
            Reflect.set(this.scope, name, value);
        }
    }

    return new ParserContextImpl();
}

createContext.ct = {
    compute: 0,
    expose: 0,
    derive: 0,
};
