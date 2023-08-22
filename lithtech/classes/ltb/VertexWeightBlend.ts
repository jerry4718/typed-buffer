import { ParserTarget, FieldIf, FieldType } from '../../../mod.ts';
import * as t from '../../../mod.ts';

@ParserTarget()
export class VertexWeightBlend {
    @FieldType(t.Float32)
    @FieldIf(({ scope }: t.ParserContext) => scope.$index > 0 && scope.meshInfo.maxBonesPerFace >= (scope.$index + 1))
    blend!: number;
}
