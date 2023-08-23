import * as t from '../../../mod.ts';
import { FieldExpose, FieldType, ParserTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';
import { WorldModel } from './WorldModel.ts';

@ParserTarget()
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

    @FieldType(t.Array, { item: t.Uint8, count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.childNumNodes * 0.125 + 1 })
    worldLayout!: number[];

    @FieldType(t.Array, { item: WorldModel, count: t.Uint32 })
    worldModels!: WorldModel[];
}
