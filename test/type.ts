// <ECOption['series']>

type Arrayify<T> = T extends (infer P)[] ? P[] : never;

type PickArrayify<T, K extends keyof T> = {
    [P in K]: Arrayify<T[P]>;
};

interface AssertArrayField<T, K extends keyof T> extends Omit<T, K>, PickArrayify<T, K> {}


type ECSeries = {
    data: number[]
};

type ECOption = {
    series: ECSeries | ECSeries[]
}


type ECOption2 = AssertArrayField<ECOption, 'series'>

const option = {} as ECOption2;

const firstSeries = option.series[0];
