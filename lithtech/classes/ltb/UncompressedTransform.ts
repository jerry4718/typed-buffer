import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';
import { Quaternion } from '../common/Quaternion.ts';
import { Vector3 } from '../common/Vector3.ts';

@ParserTarget()
export class UncompressedTransform {
    @FieldType(t.Int8)
    isVertexAnimation!: number;

    @FieldType(t.Array, {
        item: Vector3,
        count: ({ scope }) => scope.numKeyframes,
    })
    positions!: Vector3[];

    @FieldType(t.Array, {
        item: Quaternion,
        count: ({ scope }) => scope.numKeyframes,
    })
    rotations!: Quaternion[];
}
