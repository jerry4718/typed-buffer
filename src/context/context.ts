import { PrimitiveAccessor, PrimitiveEndianAccessor } from '../accessor/primitive-accessor.ts';
import { TypedArrayInstance } from '../utils/typed-array.ts';
import { Endian } from '../utils/endianness-util.ts';
import { isNumber } from '../utils/type-util.ts';
import { SafeAny } from '../utils/prototype-util.ts';

class BaseContext {
    declare public buffer: ArrayBuffer;
    declare public view: DataView;
    declare public byteOffset: number;
    declare public byteLength: number;
    declare public constant: { endian: Endian };
    declare public pos: number;

    get size() {
        return this.byteLength - this.byteOffset;
    }

    public ensureBytesLeft(length: number) {
        if (this.pos + length > this.size) {
            throw new EOFError(length, this.size - this.pos);
        }
    }

    public seek(pos: number) {
        const validated = Math.max(0, Math.min(this.size, pos));
        this.pos = (isNaN(validated) || !isFinite(validated)) ? 0 : validated;
    }
}

function createContext(mode: 'r'): ReadContext;
function createContext(mode: 'w'): WriteContext;
function createContext(mode: 'r' | 'w'): ReadContext | WriteContext {
    if (mode === 'r') {
        return new ReadContext();
    }
    return new WriteContext();
}

export type ContextScope = Record<string | symbol, SafeAny>

function objectChain(parent: ContextScope | null = null): ContextScope {
    return Object.create(parent) as ContextScope;
}

type AccessOption = {
    consume?: boolean;
    position?: number;
}

export class ReadContext extends BaseContext {
    read<Item extends (number | bigint), Container extends TypedArrayInstance<Item, Container>>(
        accessor: PrimitiveAccessor<Item, Container> | PrimitiveEndianAccessor<Item, Container>,
        { consume = true, position }: AccessOption,
        scope?: ContextScope,
    ): Item {
        const beforePos = this.pos;
        const hasSeeked = isNumber(position);
        if (hasSeeked) this.seek(position);

        let readSize = 0;
        try {
            if (accessor instanceof PrimitiveEndianAccessor) {
                readSize = accessor.BYTES_PER_DATA;
                this.ensureBytesLeft(readSize);
                return accessor.get(this.view, this.byteOffset + this.pos);
            }
            if (accessor instanceof PrimitiveAccessor) {
                readSize = accessor.BYTES_PER_DATA;
                this.ensureBytesLeft(readSize);
                return accessor.get(this.view, this.byteOffset + this.pos, this.constant.endian);
            }
            /* ****  ↑↑↑静态读取写在上面↑↑↑  ****  ↓↓↓动态读取写在下面↓↓↓  **** */
            // 动态读取才需要创建作用于链不是？
            const cs = objectChain(scope);
            throw new UnsupportedAccessorError();
        } finally {
            if (consume) this.pos = beforePos + readSize;
            if (hasSeeked) this.seek(beforePos);
        }
    }
}

export class WriteContext extends ReadContext {
    write<Item extends (number | bigint), Container extends TypedArrayInstance<Item, Container>>(
        accessor: PrimitiveAccessor<Item, Container> | PrimitiveEndianAccessor<Item, Container>,
        value: Item,
    ) {
        const byteSize = accessor.BYTES_PER_DATA;
        this.ensureBytesLeft(byteSize);
        this.pos += byteSize;
        if (accessor instanceof PrimitiveEndianAccessor) {
            accessor.set(this.view, this.byteOffset + this.pos, value);
            return;
        }
        if (accessor instanceof PrimitiveAccessor) {
            accessor.set(this.view, this.byteOffset + this.pos, value, this.constant.endian);
            return;
        }
        throw new UnsupportedAccessorError();
    }
}


export class EOFError extends Error {
    public name: string;
    public message: string;
    public stack?: string;
    public requested: number;
    public available: number;

    constructor(requested: number, available: number) {
        super();
        this.name = 'EOFError';
        this.message = `Requested ${requested} bytes, but only ${available} available`;
        this.requested = requested;
        this.available = available;
        this.stack = (new Error()).stack;
    }
}

export class UnsupportedAccessorError extends Error {
    public name: string;
    public message: string;
    public stack?: string;

    constructor() {
        super();
        this.name = 'UnsupportedAccessorError';
        this.message = `Unsupported Accessor`;
        this.stack = (new Error()).stack;
    }
}
