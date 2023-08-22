import { FieldIf, FieldType, getTypedParser, ParserTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';
import { VertexWeightBlend } from './VertexWeightBlend.ts';
import { ColorRgba } from '../common/ColorRgba.ts';
import { Vector2 } from '../../out_1692691743028_lithtech_dat.ts';
import * as t from '../../../mod.ts';

@ParserTarget()
export class VertexInfo {
    @FieldType(Vector3)
    @FieldIf(({ scope }: t.ParserContext) => scope.scope.hasPosition)
    position!: Vector3;

    @FieldType(t.Array, {
        item: getTypedParser(VertexWeightBlend<Index, scope.maxBonesPerFace>),
        size: ({ scope }: t.ParserContext) => (scope[`scope.maxBonesPerFace`] as number),
    })
    @FieldIf(({ scope }: t.ParserContext) => scope.scope.hasPosition && scope.scope.meshType === scope.MeshType.SkeletalMesh.toI)
    weightBlend!: VertexWeightBlend;

    @FieldType(Vector3)
    @FieldIf(({ scope }: t.ParserContext) => scope.scope.hasNormal)
    normal!: Vector3;

    @FieldType(ColorRgba)
    @FieldIf(({ scope }: t.ParserContext) => scope.scope.hasColor)
    color!: ColorRgba;

    @FieldType(Vector2)
    @FieldIf(({ scope }: t.ParserContext) => scope.scope.hasUv1)
    uv1!: Vector2;

    @FieldType(Vector2)
    @FieldIf(({ scope }: t.ParserContext) => scope.scope.hasUv2)
    uv2!: Vector2;

    @FieldType(Vector2)
    @FieldIf(({ scope }: t.ParserContext) => scope.scope.hasUv3)
    uv3!: Vector2;

    @FieldType(Vector2)
    @FieldIf(({ scope }: t.ParserContext) => scope.scope.hasUv4)
    uv4!: Vector2;

    @FieldType(Vector3)
    @FieldIf(({ scope }: t.ParserContext) => scope.scope.hasBasisVector)
    s!: Vector3;

    @FieldType(Vector3)
    @FieldIf(({ scope }: t.ParserContext) => scope.scope.hasBasisVector)
    t!: Vector3;
}
