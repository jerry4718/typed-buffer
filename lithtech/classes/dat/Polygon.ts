import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';
import { Plane } from './Plane.ts';

@ParserTarget()
export class Polygon {
    @FieldType(Plane)
    plane!: Plane;

    @FieldType(t.Uint32)
    numVertexesPos!: number;

    @FieldType(t.Array, {
        item: Vector3,
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.numVertexesPos,
    })
    vertexesPos!: Vector3[];
}
