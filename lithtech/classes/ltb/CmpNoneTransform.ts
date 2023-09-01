import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';
import { Quaternion } from '../common/Quaternion.ts';
import { Vector3 } from '../common/Vector3.ts';

@StructTarget()
export class CmpNoneTransform {
    @FieldType(t.Int8)
    declare isVertexAnimation: number;

    @FieldType(t.Array, {
        item: Vector3,
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.numKeyframes,
    })
    declare positions: Vector3[];

    @FieldType(t.Array, {
        item: Quaternion,
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.numKeyframes,
    })
    declare rotations: Quaternion[];
}
