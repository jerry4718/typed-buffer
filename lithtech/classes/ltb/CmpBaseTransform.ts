import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';
import { CompressedQuaternion } from '../common/CompressedQuaternion.ts';
import { CompressedVector3 } from '../common/CompressedVector3.ts';
import { Quaternion } from '../common/Quaternion.ts';
import { Vector3 } from '../common/Vector3.ts';
import { AnimCompressionType } from './enums/AnimCompressionType.ts';

@StructTarget()
export class CmpBaseTransform {
    @FieldType(t.Array, {
        item: (_: t.ParserContext, scope: t.ScopeAccessor) => {
            if (scope.compressionType === AnimCompressionType.CmpRelevant) return Vector3;
            if (scope.compressionType === AnimCompressionType.CmpRelevant16) return CompressedVector3;
            if (scope.compressionType === AnimCompressionType.CmpRelevantRot16) return Vector3;
            throw Error('cannot match [positions] type');
        },
        count: t.Uint32,
    })
    positions!: Vector3[] | CompressedVector3[];

    @FieldType(t.Array, {
        item: (_: t.ParserContext, scope: t.ScopeAccessor) => {
            if (scope.compressionType === AnimCompressionType.CmpRelevant) return Quaternion;
            if (scope.compressionType === AnimCompressionType.CmpRelevant16) return CompressedQuaternion;
            if (scope.compressionType === AnimCompressionType.CmpRelevantRot16) return CompressedQuaternion;
            throw Error('cannot match [rotations] type');
        },
        count: t.Uint32,
    })
    rotations!: Quaternion[] | CompressedQuaternion[];
}
