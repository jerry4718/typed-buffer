import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';

@ParserTarget()
export class WorldModelPolygon {
    @FieldValue(t.Uint32)
    numVertexIndexes!: number;
    @FieldType(t.Uint32)
    surfaceIndex!: number;

    @FieldType(t.Uint32)
    planeIndex!: number;

    @FieldType(t.Array, {
        item: t.Uint32,
        count: ({ scope }: t.ParserContext) => scope.numVertexIndexes,
    })
    vertexIndexes!: number;
}
