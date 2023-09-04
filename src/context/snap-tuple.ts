export interface SnapInfo {
    start: number,
    size: number,
    end: number,
    // pos: [ number, number ]
}

export type SnapTuple<T> = [ T, SnapInfo ];

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

export function createResult<T>(value: T, start: number, size: number): SnapTuple<T> {
    createResult.ct.time ++;
    // return new SnapBigIntResult(value, start, size) as unknown as SnapTuple<T>; // 117
    // return new SnapResult(value, start, size) as unknown as SnapTuple<T>; // 41s
    // return new SnapUint32(value, start, size) as unknown as SnapTuple<T>; // 103
    // return new SnapUint32Array(value, start, size) as unknown as SnapTuple<T>; // 42.5s
    return [ value, { start, size, end: start + size } ];
}

createResult.ct = {
    time: 0
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
