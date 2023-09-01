import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';
import { Plane } from './Plane.ts';

@StructTarget()
export class Polygon {
    @FieldType(Plane)
    declare plane: Plane;

    @FieldType(t.Array, { item: Vector3, count: t.Uint32 })
    declare vertexesPos: Vector3[];
}
