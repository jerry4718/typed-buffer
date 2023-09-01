import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';

@StructTarget()
export class Plane {
    @FieldType(Vector3)
    declare normal: Vector3;

    @FieldType(t.Float32)
    declare dist: number;
}
