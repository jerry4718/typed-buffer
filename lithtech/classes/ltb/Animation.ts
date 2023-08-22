import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';
import { CompressedTransform } from './CompressedTransform.ts';
import { AnimCompressionType } from './enums/AnimCompressionType.ts';
import { Keyframe } from './Keyframe.ts';
import { UncompressedTransform } from './UncompressedTransform.ts';

@ParserTarget()
export class Animation {
    @FieldType(Vector3)
    extents!: Vector3;

    @FieldType(t.String, { size: t.Uint16 })
    name!: string;

    @FieldType(t.Int32)
    compressionType!: number;

    @FieldType(t.Uint32)
    interpolationTime!: number;

    @FieldType(t.Uint32)
    numKeyframes!: number;

    @FieldType(t.Array, {
        item: Keyframe,
        count: ({ scope }: t.ParserContext) => scope.numKeyframes,
    })
    keyframes!: Keyframe;

    @FieldType(({ scope }: t.ParserContext) => {
        if (scope.compressionType === AnimCompressionType.CmpNone.toI) return UncompressedTransform<numKeyframes>;
        return CompressedTransform<compressionType>;
    })
    nodeKeyframeTransforms!: UncompressedTransform<numKeyframes> | CompressedTransform<compressionType>;
}
