import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';

@ParserTarget()
export class Matrix {
    @FieldType(t.Float32Array, { count: 4 * 4 })
    data!: Float32Array;

    get rows() {
        return [
            this.data.slice(0, 4),
            this.data.slice(4, 8),
            this.data.slice(8, 12),
            this.data.slice(12, 16),
        ];
    }
}
