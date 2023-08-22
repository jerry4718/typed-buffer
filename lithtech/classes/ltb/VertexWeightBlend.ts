import { ParserTarget, FieldIf, FieldType } from '../../../mod.ts';
import * as t from '../../../mod.ts';

@ParserTarget()
export class VertexWeightBlend {
    @FieldValue(t.Uint32)
    boneFaceIndex!: number;
    @FieldValue(t.Uint32)
    maxBonesPerFace!: number;

    @FieldType(t.Float32)
    @FieldIf(({ scope }: t.ParserContext) => scope.boneFaceIndex > 0 && scope.maxBonesPerFace >= (scope.boneFaceIndex + 1))
    blend!: number;
}
