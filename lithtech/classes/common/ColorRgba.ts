import * as t from '../../../mod.ts';
import { FieldCollection, FieldType, StructTarget } from '../../../mod.ts';

@StructTarget()
export class ColorRgba {
    @FieldType(t.Uint8Array, { count: 4 })
    @FieldCollection(Uint8Array, [ 'r', 'g', 'b', 'a' ])
    declare meta: Uint8Array;

    declare r: number;
    declare g: number;
    declare b: number;
    declare a: number;

    asArray() {
        return Array.from(this.meta);
    }
}
