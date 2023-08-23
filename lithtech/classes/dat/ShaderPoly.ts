import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';
import { Plane } from './Plane.ts';

@ParserTarget()
export class ShaderPoly {
    @FieldType(t.Array, { item: Vector3, count: t.Uint8 })
    vertexesPos!: Vector3[];

    @FieldType(Plane)
    plane!: Plane;

    @FieldType(t.Uint32)
    name!: number;
}
