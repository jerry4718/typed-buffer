import * as t from '../../../mod.ts';
import { FieldCollection, FieldType, StructTarget } from '../../../mod.ts';

@StructTarget()
export class ColorRgb {
    @FieldType(t.Float32Array, { count: 3 })
    @FieldCollection(Float32Array, [ 'r', 'g', 'b' ])
    declare meta: Float32Array;

    declare r: number;
    declare g: number;
    declare b: number;

    asArray() {
        return Array.from(this.meta);
    }
}
