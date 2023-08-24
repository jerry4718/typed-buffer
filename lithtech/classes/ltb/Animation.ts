import * as t from '../../../mod.ts';
import { FieldExpose, FieldIf, FieldType, ParserTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';
import { AnimCompressionType } from './enums/AnimCompressionType.ts';
import { Keyframe } from './Keyframe.ts';
import { NodeTransform } from './NodeTransform.ts';
import { UncompressedTransform } from './UncompressedTransform.ts';

@ParserTarget()
export class Animation {
    @FieldType(Vector3)
    extents!: Vector3;

    @FieldType(t.String, { size: t.Uint16 })
    name!: string;

    @FieldType(t.Int32)
    @FieldExpose()
    compressionType!: number;

    @FieldType(t.Uint32)
    interpolationTime!: number;

    @FieldType(t.Uint32)
    @FieldExpose()
    numKeyframes!: number;

    @FieldType(t.Array, {
        item: Keyframe,
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.numKeyframes,
    })
    keyframes!: Keyframe[];

    @FieldType((_: t.ParserContext, scope: t.ScopeAccessor) => {
        if (scope.compressionType === AnimCompressionType.CmpNone) {
            return t.Array({ item: UncompressedTransform, count: 1 });
        }
        return t.Array({ item: NodeTransform, count: () => scope.header.numNodes });
    })
    transforms!: UncompressedTransform[] | NodeTransform[];
}
