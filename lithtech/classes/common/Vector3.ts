import * as t from '../../../mod.ts';
import { FieldCollection, FieldType, StructTarget } from '../../../mod.ts';

@StructTarget()
export class Vector3 {
    @FieldType(t.Float32Array, { count: 3 })
    @FieldCollection(Float32Array, [ 'x', 'y', 'z' ])
    declare meta: Float32Array;

    declare x: number;
    declare y: number;
    declare z: number;

    asArray() {
        return Array.from(this.meta);
    }
}
