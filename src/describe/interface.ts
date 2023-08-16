export interface TypedArrayFactory<Item, Instance> {
    new(length: number): Instance;

    new(array: ArrayLike<Item> | ArrayBufferLike): Instance;

    new(buffer: ArrayBufferLike, byteOffset?: number, length?: number): Instance;

    of(...items: Item[]): Instance;

    from(array: ArrayLike<Item>): Instance;

    from<T>(array: ArrayLike<T>, convert: (v: T, k: number) => Item, thisArg?: any): Instance;
}

export interface TypedArrayInterface<Item, Instance> {
    readonly length: number;

    [index: number]: Item;

    keys(): IterableIterator<number>;

    values(): IterableIterator<Item>;

    entries(): IterableIterator<[ number, Item ]>;

    [Symbol.iterator](): IterableIterator<Item>;

    copyWithin(target: number, start?: number, end?: number): this;

    set(array: ArrayLike<Item>, offset?: number): void;

    subarray(begin?: number, end?: number): Instance;

    slice(start?: number, end?: number): Instance;

    fill(value: Item, start?: number, end?: number): this;

    indexOf(searchElement: Item, fromIndex?: number): number;

    lastIndexOf(searchElement: Item, fromIndex?: number): number;

    includes(searchElement: Item, fromIndex?: number): boolean;

    forEach(callback: (value: Item, index: number, array: Instance) => void, thisArg?: any): void;

    map(callback: (value: Item, index: number, array: Instance) => Item, thisArg?: any): Instance;

    filter(predicate: (value: Item, index: number, array: Instance) => boolean, thisArg?: any): Instance;

    reduce(callback: (previousValue: Item, currentValue: Item, currentIndex: number, array: Instance) => Item): Item;

    reduce<U>(callback: (previousValue: U, currentValue: Item, currentIndex: number, array: Instance) => U, initialValue: U): U;

    reduceRight(callback: (previousValue: Item, currentValue: Item, currentIndex: number, array: Instance) => Item): Item;

    reduceRight<U>(callback: (previousValue: U, currentValue: Item, currentIndex: number, array: Instance) => U, initialValue: U): U;

    find(predicate: (value: Item, index: number, array: Instance) => boolean, thisArg?: any): Item | undefined;

    findIndex(predicate: (value: Item, index: number, array: Instance) => boolean, thisArg?: any): number;

    every(predicate: (value: Item, index: number, array: Instance) => boolean, thisArg?: any): boolean;

    some(predicate: (value: Item, index: number, array: Instance) => boolean, thisArg?: any): boolean;

    reverse(): this;

    sort(compareFn?: (a: Item, b: Item) => number | Item): this;

    join(separator?: string): string;

    toString(): string;

    toLocaleString(): string;

    valueOf(): Instance;
}

type Unique<A, B> = { [K in keyof A]: K extends keyof B ? B[K] : A[K] } & B;

export type TypedArrayInstance<Item, Instance> = Unique<Instance, TypedArrayInterface<Item, Instance>>
export type TypedArrayConstructor<Item, Instance> = TypedArrayFactory<Item, TypedArrayInstance<Item, Instance>>

const DescribedInt8Array = Int8Array as TypedArrayConstructor<number, Int8Array>;
const DescribedUint8Array = Uint8Array as TypedArrayConstructor<number, Uint8Array>;
const DescribedInt16Array = Int16Array as TypedArrayConstructor<number, Int16Array>;
const DescribedUint16Array = Uint16Array as TypedArrayConstructor<number, Uint16Array>;
const DescribedInt32Array = Int32Array as TypedArrayConstructor<number, Int32Array>;
const DescribedUint32Array = Uint32Array as TypedArrayConstructor<number, Uint32Array>;
const DescribedFloat32Array = Float32Array as TypedArrayConstructor<number, Float32Array>;
const DescribedFloat64Array = Float64Array as TypedArrayConstructor<number, Float64Array>;
const DescribedBigInt64Array = BigInt64Array as TypedArrayConstructor<bigint, BigInt64Array>;
const DescribedBigUint64Array = BigUint64Array as TypedArrayConstructor<bigint, BigUint64Array>;

export {
    DescribedInt8Array as Int8Array,
    DescribedUint8Array as Uint8Array,
    DescribedInt16Array as Int16Array,
    DescribedUint16Array as Uint16Array,
    DescribedInt32Array as Int32Array,
    DescribedUint32Array as Uint32Array,
    DescribedFloat32Array as Float32Array,
    DescribedFloat64Array as Float64Array,
    DescribedBigInt64Array as BigInt64Array,
    DescribedBigUint64Array as BigUint64Array,
};
