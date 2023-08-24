export interface SnapInfo {
    start: number,
    size: number,
    end: number,
    // pos: [ number, number ]
}

export type SnapTuple<T> = [ T, SnapInfo ];

export function createResult<T>(value: T, start: number, size: number): SnapTuple<T> {
    const end = start + size;
    return [ value, Object.freeze({ start, size, end }) ] as SnapTuple<T>;
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
