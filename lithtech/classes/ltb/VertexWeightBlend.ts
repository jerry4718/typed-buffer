import { StructTarget, FieldIf, FieldType } from '../../../mod.ts';
import * as t from '../../../mod.ts';

@StructTarget()
export class VertexWeightBlend {
    @FieldType(t.Float32)
    @FieldIf((_: t.ParserContext, scope: t.ScopeAccessor) => scope.$index > 0 && scope.maxBonesPerFace >= (scope.$index + 1))
    declare blend: number;
}
