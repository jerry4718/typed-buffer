import * as t from '../../../mod.ts';
import { FieldExpose, FieldType, StructTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';
import { WorldModel } from './WorldModel.ts';

@StructTarget()
export class WorldTree {
    @FieldType(Vector3)
    boxMin!: Vector3;

    @FieldType(Vector3)
    boxMax!: Vector3;

    @FieldType(t.Uint32)
    @FieldExpose()
    childNumNodes!: number;

    @FieldType(t.Uint32)
    dummyTerrainDepth!: number;

    // Oct-tree stored bitwise
    @FieldType(t.Uint8Array, { count: (_: t.ParserContext, scope: t.ScopeAccessor) => Math.floor(scope.childNumNodes / 8 + 1) })
    worldLayout!: Uint8Array;

    @FieldType(t.Array, { item: WorldModel, count: t.Uint32 })
    worldModels!: WorldModel[];
}
