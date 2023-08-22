import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';

@ParserTarget()
export class Plane {
    @FieldType(Vector3)
    normal!: Vector3;

    @FieldType(t.Float32)
    dist!: number;
}
