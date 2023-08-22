import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';

@ParserTarget()
export class MatrixRow {
    @FieldType(t.Array, { item: t.Float32, count: 4 })
    data!: number[];
}

@ParserTarget()
export class Matrix {
    @FieldType(t.Array, { item: MatrixRow, count: 4 })
    rows!: MatrixRow[];

    get data() {
        return [
            ...this.rows[0].data,
            ...this.rows[1].data,
            ...this.rows[2].data,
            ...this.rows[3].data,
        ];
    }
}
