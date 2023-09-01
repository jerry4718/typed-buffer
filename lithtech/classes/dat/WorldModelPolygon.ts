import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';

@StructTarget()
export class WorldModelPolygon {
    @FieldType(t.Uint32)
    surfaceIndex!: number;

    @FieldType(t.Uint32)
    planeIndex!: number;

    @FieldType(t.Uint32Array, {
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.vertexCountList[scope.$index],
    })
    vertexIndexes!: Uint32Array;
}
