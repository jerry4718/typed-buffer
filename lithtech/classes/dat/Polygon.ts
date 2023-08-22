import * as t from '../../../mod.ts';
import { FieldType, getTypedParser, ParserTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';
import { Plane } from './Plane.ts';

@ParserTarget()
export class Polygon {
    @FieldType(Plane)
    plane!: Plane;

    @FieldType(t.Uint32)
    numVertexesPos!: number;

    @FieldType(t.Array, {
        item: getTypedParser(Vector3),
        size: ({ scope }: t.ParserContext) => (scope[`numVertexesPos`] as number),
    })
    vertexesPos!: Vector3;
}