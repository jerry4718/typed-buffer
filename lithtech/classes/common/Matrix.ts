import * as t from '../../../mod.ts';
import { FieldType, getTypedParser, ParserTarget } from '../../../mod.ts';

@ParserTarget()
export class MatrixRow {
    @FieldType(t.Array, { item: t.Float32, size: 4 })
    data!: number[];
}

@ParserTarget()
export class Matrix {
    @FieldType(t.Array, { item: getTypedParser(MatrixRow), size: 4 })
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
