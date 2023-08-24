import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';

@ParserTarget()
export class Matrix {
    @FieldType(t.Array, { item: t.Float32, count: 4 * 4 })
    data!: number[];

    get rows() {
        return [
            this.data.slice(0, 4),
            this.data.slice(4, 8),
            this.data.slice(8, 12),
            this.data.slice(12, 16),
        ];
    }
}
