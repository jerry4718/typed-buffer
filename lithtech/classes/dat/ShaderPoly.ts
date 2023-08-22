import * as t from '../../../mod.ts';
import { FieldIf, FieldType, getTypedParser, ParserTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';
import { Plane } from './Plane.ts';

@ParserTarget()
export class ShaderPoly {
    @FieldType(t.Uint8)
    numVertexesPos!: number;

    @FieldType(t.Array, {
        item: getTypedParser(Vector3),
        size: ({ scope }: t.ParserContext) => (scope[`numVertexesPos`] as number),
    })
    @FieldIf(({ scope }: t.ParserContext) => scope.numVertexesPos !== 0)
    vertexesPos!: Vector3;

    @FieldType(Plane)
    plane!: Plane;

    @FieldType(t.Uint32)
    name!: number;
}
