import * as t from '../../../mod.ts';
import { FieldType, getTypedParser, ParserTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';
import { WorldModel } from './WorldModel.ts';

@ParserTarget()
export class WorldTree {
    @FieldType(Vector3)
    boxMin!: Vector3;

    @FieldType(Vector3)
    boxMax!: Vector3;

    @FieldType(t.Uint32)
    childNumNodes!: number;

    @FieldType(t.Uint32)
    dummyTerrainDepth!: number;

    @FieldType(t.Array, { item: t.Uint8, size: ({ scope }: t.ParserContext) => (scope.childNumNodes as number * 0.125 + 1) })
    worldLayout!: number[];

    @FieldType(t.Uint32)
    numWorldModels!: number;

    @FieldType(t.Array, {
        item: getTypedParser(WorldModel),
        size: ({ scope }: t.ParserContext) => (scope[`numWorldModels`] as number),
    })
    worldModels!: WorldModel;
}
