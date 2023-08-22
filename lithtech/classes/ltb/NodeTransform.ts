import * as t from '../../../mod.ts';
import { FieldType, getTypedParser, ParserTarget } from '../../../mod.ts';
import { CompressedQuaternion } from '../common/CompressedQuaternion.ts';
import { CompressedVector3 } from '../common/CompressedVector3.ts';
import { Quaternion } from '../common/Quaternion.ts';
import { Vector3 } from '../common/Vector3.ts';
import { AnimCompressionType } from './enums/AnimCompressionType.ts';

@ParserTarget()
export class NodeTransform {
    @FieldValue(t.Int32)
    compressionType!: number;
    @FieldType(t.Uint32)
    numPositions!: number;

    @FieldType(t.Array, {
        item: ({ scope }: t.ParserContext) => {
            if (scope.compressionType === AnimCompressionType.CmpRelevant) return getTypedParser(Vector3);
            if (scope.compressionType === AnimCompressionType.CmpRelevant16) return getTypedParser(CompressedVector3);
            if (scope.compressionType === AnimCompressionType.CmpRelevantRot16) return getTypedParser(Vector3);
        },
        size: ({ scope }: t.ParserContext) => (scope.numPositions as number),
    })
    positions!: Vector3 | CompressedVector3;

    @FieldType(t.Uint32)
    numRotations!: number;

    @FieldType(t.Array, {
        item: ({ scope }: t.ParserContext) => {
            if (scope.compressionType === AnimCompressionType.CmpRelevant) return getTypedParser(Quaternion);
            if (scope.compressionType === AnimCompressionType.CmpRelevant16) return getTypedParser(CompressedQuaternion);
            if (scope.compressionType === AnimCompressionType.CmpRelevantRot16) return getTypedParser(CompressedQuaternion);
        },
        size: ({ scope }: t.ParserContext) => (scope[`numRotations`] as number),
    })
    rotations!: Quaternion | CompressedQuaternion;
}
