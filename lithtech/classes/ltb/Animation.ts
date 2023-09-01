import * as t from '../../../mod.ts';
import { FieldExpose, FieldType, StructTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';
import { CmpNoneTransform } from './CmpNoneTransform.ts';
import { CmpRelevant16Transform } from './CmpRelevant16Transform.ts';
import { CmpRelevantRot16Transform } from './CmpRelevantRot16Transform.ts';
import { CmpRelevantTransform } from './CmpRelevantTransform.ts';
import { AnimCompressionType } from './enums/AnimCompressionType.ts';
import { Keyframe } from './Keyframe.ts';

@StructTarget()
export class Animation {
    @FieldType(Vector3)
    declare extents: Vector3;

    @FieldType(t.String, { size: t.Uint16 })
    declare name: string;

    @FieldType(t.Int32)
    @FieldExpose()
    declare compressionType: number;

    @FieldType(t.Uint32)
    @FieldExpose()
    declare interpolationTime: number;

    // @FieldType(t.Uint32)
    // @FieldExpose()
    // declare numKeyframes: number;

    @FieldType(t.Array, { item: Keyframe, count: t.Uint32 })
    declare keyframes: Keyframe[];

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
    declare transforms: CmpNoneTransform[] | CmpRelevantTransform[] | CmpRelevant16Transform[] | CmpRelevantRot16Transform[];
}
