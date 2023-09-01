import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';

@StructTarget()
export class Matrix {
    @FieldType(t.Float32Array, { count: 4 * 4 })
    declare data: Float32Array;

    get rows() {
        return [
            this.data.slice(0, 4),
            this.data.slice(4, 8),
            this.data.slice(8, 12),
            this.data.slice(12, 16),
        ];
    }
}
