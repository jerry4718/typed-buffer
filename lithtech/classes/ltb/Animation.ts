import * as t from '../../../mod.ts';
import { FieldExpose, FieldType, ParserTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';
import { CmpNoneTransform } from './CmpNoneTransform.ts';
import { CmpRelevant16Transform } from './CmpRelevant16Transform.ts';
import { CmpRelevantRot16Transform } from './CmpRelevantRot16Transform.ts';
import { CmpRelevantTransform } from './CmpRelevantTransform.ts';
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

    @FieldType(t.Array, {
        item: (_: t.ParserContext, scope: t.ScopeAccessor) => {
            const type = scope.compressionType;
            if (type === AnimCompressionType.CmpNone) return CmpNoneTransform;
            if (type === AnimCompressionType.CmpRelevant) return CmpRelevantTransform;
            if (type === AnimCompressionType.CmpRelevant16) return CmpRelevant16Transform;
            if (type === AnimCompressionType.CmpRelevantRot16) return CmpRelevantRot16Transform;
            throw Error(`unknown compressionType:${type}`);
        },
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => {
            if (scope.compressionType === AnimCompressionType.CmpNone) return 1;
            return scope.header.numNodes;
        },
    })
        // @FieldType((_: t.ParserContext, scope: t.ScopeAccessor) => {
        //     const count = () => scope.header.numNodes;
        //     if (scope.compressionType === AnimCompressionType.CmpNone) {
        //         return t.Array({ item: UncompressedTransform, count: 1 });
        //     }
        //     return t.Array({ item: NodeTransform, count });
        // })
    transforms!: UncompressedTransform[] | NodeTransform[];
}
