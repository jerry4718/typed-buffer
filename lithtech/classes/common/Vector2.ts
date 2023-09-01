import * as t from '../../../mod.ts';
import { FieldCollection, FieldType, StructTarget } from '../../../mod.ts';

@StructTarget()
export class Vector2 {
    @FieldType(t.Float32Array, { count: 2 })
    @FieldCollection(Float32Array, [ 'x', 'y' ])
    declare meta: Float32Array;

    declare x: number;
    declare y: number;

    asArray() {
        return Array.from(this.meta);
    }
}
