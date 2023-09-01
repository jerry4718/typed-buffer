import * as t from '../../../mod.ts';
import { FieldCollection, FieldType, StructTarget } from '../../../mod.ts';

@StructTarget()
export class Quaternion {
    @FieldType(t.Float32Array, { count: 4 })
    @FieldCollection(Float32Array, [ 'x', 'y', 'z', 'w' ])
    declare meta: Float32Array;

    declare x: number;
    declare y: number;
    declare z: number;
    declare w: number;

    asArray() {
        return Array.from(this.meta);
    }
}
