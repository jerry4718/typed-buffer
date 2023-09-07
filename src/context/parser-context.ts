import { Ascii } from '../coding/codings.ts';
import { BufferParser } from '../parse/buffer-parser.ts';
import { PrimitiveParser } from '../parse/primitive-parser.ts';
import { changeTypedArrayEndianness, Endian, NATIVE_ENDIANNESS } from '../utils/endianness-util.ts';
import { scopeChain } from './access-chain.ts';
import { AdvancedParser, BaseParser } from './base-parser.ts';
import { createResult, SnapTuple } from './snap-tuple.ts';
import { AccessOption, ContextCompute, ContextConstant, ParserContext, ScopeAccessor } from './types.ts';
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

export function createContext(buffer: ArrayBuffer, inputConstant: Partial<ContextConstant> = {}, byteOffset = 0) {
    const view = new DataView(buffer);

    const constant: ContextConstant = { ...defaultContextConstant, ...inputConstant };
    const { $path, path: rootPath, endian: rootEndian } = constant;

    const rootScope: ScopeAccessor = { [$path]: rootPath };

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

        scope: ScopeAccessor;
        byteOffset: number;
        byteLength: number;
        pos: number;

        constructor() {
            this.scope = scopeChain(rootScope);
            this.byteOffset = byteOffset;
            this.byteLength = buffer.byteLength;
            this.pos = 0;
        }

        get start() {
            return this.byteOffset;
        }

        get size() {
            return this.byteLength - this.byteOffset;
        }

        get end() {
            return this.byteLength;
        }

        public seek(pos: number) {
            const validated = Math.max(0, Math.min(this.size, pos));
            this.pos = (isNaN(validated) || !isFinite(validated)) ? 0 : validated;
        }

        get take() {
            return [ this.start, this.pos ] as [ number, number ];
        }

        consume(consume: boolean | undefined, hasSeeked?: boolean) {
            return !hasSeeked && (isUndefined(consume) || consume);
        }

        u8View(specify: ({ size: number } | { count: number }), patchOption?: Partial<AccessOption>): Uint8Array {
            const { size: specSize, count: specCount } = specify as { count: number, size: number };

            if (isUndefined(specSize) && isUndefined(specCount)) {
                throw Error('Either `count` or `size` must be specified when calling `bufferView`');
            }

            const viewSize = isNumber(specSize) ? specSize : specCount;

            const pos = this.pos;
            const seek = patchOption?.pos;
            const consume = patchOption?.consume;
            const hasSeeked = isNumber(seek);
            if (hasSeeked) this.seek(seek);

            const view = new Uint8Array(this.buffer, this.pos, viewSize);
            this.pos += viewSize;
            if (!this.consume(consume, hasSeeked)) this.pos = pos;
            return view;
        }

        readBuffer<Item extends number | bigint, Instance extends TypedArrayInstance<Item, Instance>>(
            typedArrayFactory: TypedArrayFactory<Item, Instance>,
            specify: { endian?: Endian } & ({ size: number } | { count: number }),
            patchOption?: Partial<AccessOption>,
        ): Instance {
            const { size: specSize, count: specCount } = specify as { count: number, size: number };

            if (isUndefined(specSize) && isUndefined(specCount)) {
                throw Error('Either `count` or `size` must be specified when calling `bufferRead`');
            }

            const bytesPerElement = typedArrayFactory.BYTES_PER_ELEMENT;
            const readSize = isNumber(specSize) ? specSize : (specCount * bytesPerElement);

            const pos = this.pos;
            const seek = patchOption?.pos;
            const consume = patchOption?.consume;
            const hasSeeked = isNumber(seek);
            if (hasSeeked) this.seek(seek);

            const copyBuffer = this.buffer.slice(this.pos, this.pos + readSize);

            const result = Reflect.construct(typedArrayFactory, [ copyBuffer ]);

            this.pos += readSize;
            if (!this.consume(consume, hasSeeked)) this.pos = pos;

            const selectedEndian = specify.endian || rootEndian;
            return selectedEndian === NATIVE_ENDIANNESS ? result : changeTypedArrayEndianness(result);
        }

        writeBuffer<Item extends number | bigint, Instance extends TypedArrayInstance<Item, Instance>>(
            value: Instance,
            specify: { endian?: Endian },
            patchOption?: Partial<AccessOption>,
        ): Instance {
            const selectedEndian = specify.endian || rootEndian;
            const writeValue = selectedEndian === NATIVE_ENDIANNESS ? value : changeTypedArrayEndianness(value);

            const pos = this.pos;
            const seek = patchOption?.pos;
            const consume = patchOption?.consume;
            const hasSeeked = isNumber(seek);
            if (hasSeeked) this.seek(seek);

            const writeSize = writeValue.byteLength;

            new Uint8Array(this.buffer).set(new Uint8Array(writeValue.buffer), this.pos);

            this.pos += writeSize;
            if (!this.consume(consume, hasSeeked)) this.pos = pos;

            return value;
        }

        $$read<T>(parser: BaseParser<T>, patchOption?: Partial<AccessOption>): SnapTuple<T> {
            const start = this.byteOffset;
            const prevSize = this.byteLength;
            const value = this.read(parser, patchOption);
            return createResult(value, start + prevSize, this.byteLength - prevSize);
        }

        read<T>(parser: BaseParser<T>, patchOption?: Partial<AccessOption>): T {
            const pos = this.pos;
            const seek = patchOption?.pos;
            const consume = patchOption?.consume;
            const hasSeeked = isNumber(seek);
            if (hasSeeked) this.seek(seek);

            // 判断parser是否为Primitive，Primitive直接在ctx中读取，避免创建多余的subContext
            if (parser instanceof PrimitiveParser || parser instanceof BufferParser) {
                const value = parser.read(this, this.pos, rootEndian);

                this.pos += parser.bytesPerData;
                if (!this.consume(consume, hasSeeked)) this.pos = pos;

                return value;
            }

            if (parser instanceof AdvancedParser) {
                this.scope = scopeChain(this.scope);
                const value = parser.read(this, this.pos);

                if (!this.consume(consume, hasSeeked)) this.pos = pos;

                this.scope = Object.getPrototypeOf(this.scope);
                return value;
            }

            throw Error('unknown Parser type');
        }

        $$write<T>(parser: BaseParser<T>, value: T, patchOption?: Partial<AccessOption>): SnapTuple<T> {
            const start = this.byteOffset;
            const prevSize = this.byteLength;
            this.write(parser, value, patchOption);
            return createResult(value, start + prevSize, this.byteLength - prevSize);
        }

        write<T>(parser: BaseParser<T>, value: T, patchOption?: Partial<AccessOption>): T {
            const pos = this.pos;
            const seek = patchOption?.pos;
            const consume = patchOption?.consume;
            const hasSeeked = isNumber(seek);
            if (hasSeeked) this.seek(seek);

            if (parser instanceof PrimitiveParser) {
                const primitiveContext = { buffer, view } as ParserContext;

                parser.write(primitiveContext, value, this.pos, rootEndian);

                this.pos += parser.bytesPerData;
                if (!this.consume(consume, hasSeeked)) this.pos = pos;

                return value;
            }

            if (parser instanceof AdvancedParser) {
                this.scope = scopeChain(this.scope);
                parser.write(this, value, this.pos);
                if (!this.consume(consume, hasSeeked)) this.pos = pos;
                this.scope = Object.getPrototypeOf(this.scope);
                return value;
            }

            throw Error('unknown Parser type');
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
