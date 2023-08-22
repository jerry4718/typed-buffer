import * as t from '../../../mod.ts';
import { FieldType, getTypedParser, ParserTarget } from '../../../mod.ts';
import { Str2H } from '../common/Str2H.ts';
import { Vector3 } from '../common/Vector3.ts';
import { CompressedTransform } from './CompressedTransform.ts';
import { AnimCompressionType } from './enum.ts';
import { Keyframe } from './Keyframe.ts';
import { UncompressedTransform } from './UncompressedTransform.ts';

@ParserTarget()
export class Animation {
    @FieldType(Vector3)
    extents!: Vector3;

    @FieldType(Str2H)
    nameBox!: Str2H;

    @FieldType(t.Int32)
    compressionType!: number;

    @FieldType(t.Uint32)
    interpolationTime!: number;

    @FieldType(t.Uint32)
    numKeyframes!: number;

    @FieldType(t.Array, {
        item: getTypedParser(Keyframe),
        size: ({ scope }: t.ParserContext) => (scope[`numKeyframes`] as number),
    })
    keyframes!: Keyframe;

    @FieldType(({ scope }: t.ParserContext) => {
        if (scope.compressionType === AnimCompressionType.CmpNone.toI) return UncompressedTransform<numKeyframes>;
        return CompressedTransform<compressionType>;
    })
    nodeKeyframeTransforms!: UncompressedTransform<numKeyframes> | CompressedTransform<compressionType>;

    get name() {
        return this.nameBox.data;
    }
}
