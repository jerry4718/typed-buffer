// <ECOption['series']>

type Arrayify<T> = T extends (infer P)[] ? P[] : never;

type PickArrayify<T, K extends keyof T> = {
    [P in K]: Arrayify<T[P]>;
};

interface AssertArrayField<T, K extends keyof T> extends Omit<T, K>, PickArrayify<T, K> {
}


type ECSeries = {
    data: number[]
};

type ECOption = {
    series: ECSeries | ECSeries[]
}


type ECOption2 = AssertArrayField<ECOption, 'series'>

const option = {} as ECOption2;

const firstSeries = option.series[0];


class A {
    constructor() {
    }
}

interface B<T> {
    value: T;
}

type Decorator<Input, Output = Input> = (value: Input, context: {
    kind: string;
    name: string | symbol;
    access: {
        get?(): unknown;
        set?(value: unknown): void;
    };
    private?: boolean;
    static?: boolean;
    addInitializer?(initializer: () => void): void;
}) => Output | void;

function decoClass(a) {
    return function () {

    };
}

function decoField(a): Decorator<any, any> {
    return function () {

    };
}

type AnonymousDeriveConstructor<P, E> = {
    new(): P & E
}

function createDerive<K extends string, V>(fieldName: K, source: V): AnonymousDeriveConstructor<A, { [k in K]: V } & B<number>> {
    return (
        @decoClass(2)
        class AnonymousDerive extends A implements B<number> {
            value: number;
            @decoField(2) [fieldName]: number;
        }
    );
}

const Derive = createDerive('name', 1);

const body = new Derive();
