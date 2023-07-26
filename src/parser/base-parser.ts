import { isFunction, isUndefined } from '@/utils/type-util';

export type ParserContext<T, P = any, R = any> = {
    buffer: ArrayBuffer,
    section?: Partial<T>,
    parent?: P,
    root?: R,
}

export function createContext<T, P>(section?: Partial<T>, parent?: ParserContext<P>): ParserContext<T, P> {
    let initSection = section;

    const sectionDescriptor: PropertyDescriptor = {
        get() {
            return initSection;
        },
        set(value: Partial<T>) {
            initSection = value;
        },
    };

    return Object.defineProperties(
        {} as ParserContext<T, P>,
        {
            buffer: { get: () => parent.buffer },
            section: sectionDescriptor,
            parent: { get: () => parent?.section },
            root: { get: () => parent?.root ?? section },
        },
    );
}

export interface ValueSpec<T> {
    value: T,
    byteSize: number,
    offsetStart: number,
    offsetEnd: number,
    offset: [ number, number ]
}

export type Endian = 'le' | 'be'

export interface ParserOptionComposable {
    eos?: number,
    endian?: Endian,
}

export abstract class BaseParser<T> {
    abstract read(ctx: ParserContext<T>, byteOffset: number, option?: ParserOptionComposable): ValueSpec<T>;

    abstract write(ctx: ParserContext<T>, byteOffset: number, value: T, option?: ParserOptionComposable): ValueSpec<T>;

    protected valueSpec(value: T, byteOffset: number, byteSize: number): ValueSpec<T> {
        return BaseParser.valueSpec(value, byteOffset, byteSize);
    }

    static valueSpec<T>(value: T, byteOffset: number, byteSize: number): ValueSpec<T> {
        const positionStart = byteOffset;
        const positionEnd = byteOffset + byteSize;
        const position = [ positionStart, positionEnd ];

        return Object.defineProperties(
            {} as ValueSpec<T>,
            {
                value: { get: () => value },
                byteSize: { get: () => byteSize },
                offsetStart: { get: () => positionStart },
                offsetEnd: { get: () => positionEnd },
                offset: { get: () => position.slice() },
            },
        );
    }
}

export abstract class AdvancedParser<T> extends BaseParser<T> {
}
