import * as t from '../../../mod.ts';
import { FieldType, getTypedParser, ParserTarget } from '../../../mod.ts';
import { Quaternion } from '../common/Quaternion.ts';
import { Vector3 } from '../common/Vector3.ts';

@ParserTarget()
export class UncompressedTransform {
    @FieldValue(t.Uint32)
    numKeyframes!: number;
    @FieldType(t.Int8)
    isVertexAnimation!: number;

    @FieldType(t.Array, {
        item: getTypedParser(Vector3),
        size: ({ scope }: t.ParserContext) => (scope.numKeyframes as number),
    })
    positions!: Vector3;

    @FieldType(t.Array, {
        item: getTypedParser(Quaternion),
        size: ({ scope }: t.ParserContext) => (scope.numKeyframes as number),
    })
    rotations!: Quaternion;
}