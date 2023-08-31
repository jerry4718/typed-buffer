export interface SnapInfo {
    start: number,
    size: number,
    end: number,
    // pos: [ number, number ]
}

export type SnapTuple<T> = [ T, SnapInfo ];

const BigInt32Max = BigInt(Math.pow(2, 32) - 1);

class SnapBigInt implements SnapInfo {
    private readonly sn: bigint;

    constructor(start: number, size: number) {
        this.sn = (BigInt(start) << 32n) | BigInt(size);
    }

    get start(): number {
        return Number(this.sn >> 32n);
    }

    get size(): number {
        return Number(this.sn | BigInt32Max);
    }

    get end() {
        return this.start + this.size;
    }
}

const Uint8Max = Math.pow(2, 8) - 1;
const Uint16Max = Math.pow(2, 16) - 1;
const Uint32Max = Math.pow(2, 32) - 1;

class SnapUintArray implements SnapInfo {
    private readonly buf: Uint8Array | Uint16Array | Uint32Array;

    constructor(start: number, size: number) {
        if (start >= Uint16Max || size >= Uint16Max) {
            this.buf = Uint32Array.of(start, size);
            return;
        }
        if (start >= Uint8Max && size >= Uint8Max) {
            this.buf = Uint16Array.of(start, size);
            return;
        }
        this.buf = Uint8Array.of(start, size);
    }

    get start(): number {
        return this.buf.at(0) as number;
    }

    get size(): number {
        return this.buf.at(1) as number;
    }

    get end() {
        return this.start + this.size;
    }
}

class SnapResult<T> {
    constructor(
        private readonly value: T,
        private readonly start: number,
        private readonly size: number,
    ) {
    }

    * [Symbol.iterator]() {
        yield this.value;
        yield { start: this.start, size: this.size, end: this.start + this.size };
    }
}

class SnapUint32Array<T> {
    private readonly bf: Uint32Array;

    constructor(
        private readonly value: T,
        start: number,
        size: number,
    ) {
        this.bf = Uint32Array.of(start, size);
    }

    get start() {
        return this.bf.at(0)!;
    }

    get size() {
        return this.bf.at(1)!;
    }

    * [Symbol.iterator]() {
        yield this.value;
        yield { start: this.start, size: this.size, end: this.start + this.size };
    }
}

class SnapUint32<T> {
    private readonly bf: ArrayBuffer;

    constructor(
        private readonly value: T,
        start: number,
        size: number,
    ) {
        this.bf = Uint32Array.of(start, size).buffer;
    }

    get start() {
        return new DataView(this.bf).getUint32(0);
    }

    get size() {
        return new DataView(this.bf).getUint32(4);
    }

    * [Symbol.iterator]() {
        yield this.value;
        yield { start: this.start, size: this.size, end: this.start + this.size };
    }
}

class SnapBigIntResult<T> {
    private readonly sn: bigint;

    constructor(
        private readonly value: T,
        start: number,
        size: number,
    ) {
        this.sn = (BigInt(start) << 32n) | BigInt(size);
    }

    get start(): number {
        return Number(this.sn >> 32n);
    }

    get size(): number {
        return Number(this.sn | BigInt32Max);
    }

    get end() {
        return this.start + this.size;
    }

    * [Symbol.iterator]() {
        yield this.value;
        yield this;
    }
}

export function createResult<T>(value: T, start: number, size: number): SnapTuple<T> {
    // return new SnapBigIntResult(value, start, size) as unknown as SnapTuple<T>; // 117
    return new SnapResult(value, start, size) as unknown as SnapTuple<T>; // 41s
    // return new SnapUint32(value, start, size) as unknown as SnapTuple<T>; // 103
    // return new SnapUint32Array(value, start, size) as unknown as SnapTuple<T>; // 42.5s
}

export interface WithValue<T> {
    value: T,
}

export interface WithSnap {
    snap: SnapInfo;
}

export type WithValueSnap<T> =
    & [ T, SnapInfo ]
    & SnapInfo
    & WithValue<T>
    & WithSnap

export function createValueSnap<T>(value: T, start: number, size: number): WithValueSnap<T> {
    const end = start + size;

    const snap: SnapInfo = Object.freeze({ start, size, end });
    const pair: SnapTuple<T> = [ value, snap ];

    function* iterator(this: SnapTuple<T>) {
        yield this[0];
        yield this[1];
    }

    Reflect.defineProperty(pair, 'value', { enumerable: false, writable: false, value: value });
    Reflect.defineProperty(pair, 'snap', { enumerable: false, writable: false, value: snap });
    Reflect.defineProperty(pair, Symbol.iterator, { enumerable: false, writable: false, value: iterator });
    Reflect.setPrototypeOf(pair, snap);

    return pair as WithValueSnap<T>;
}
