import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';

@StructTarget()
export class WorldModelPolygon {
    @FieldType(t.Uint32)
    declare surfaceIndex: number;

    @FieldType(t.Uint32)
    declare planeIndex: number;

    @FieldType(t.Uint32Array, {
        // todo: 这里的调用也很频繁，酌情优化
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.vertexCountList[scope.$index],
    })
    declare vertexIndexes: Uint32Array;
}
