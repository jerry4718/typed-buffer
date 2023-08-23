import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';

@ParserTarget()
export class WorldModelPolygon {
    @FieldType(t.Uint32)
    surfaceIndex!: number;

    @FieldType(t.Uint32)
    planeIndex!: number;

    @FieldType(t.Array, {
        item: t.Uint32,
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.vertexCountList[scope.$index],
    })
    vertexIndexes!: number[];
}
