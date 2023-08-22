import * as t from '../../../mod.ts';
import { FieldIf, FieldType, ParserTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';
import { VertexWeightBlend } from './VertexWeightBlend.ts';
import { ColorRgba } from '../common/ColorRgba.ts';
import { MeshType } from './enums/MeshType.ts';
import { Vector2 } from '../common/Vector2.ts';

@ParserTarget()
export class VertexInfo {
    @FieldType(Vector3)
    @FieldIf(({ scope }: t.ParserContext) => scope.hasPosition)
    position!: Vector3;

    @FieldType(t.Array, {
        item: VertexWeightBlend,
        count: ({ scope }: t.ParserContext) => scope.mesgInfo.maxBonesPerFace,
    })
    @FieldIf(({ scope }: t.ParserContext) => scope.hasPosition && scope.meshType === MeshType.SkeletalMesh)
    weightBlend!: VertexWeightBlend[];

    @FieldType(Vector3)
    @FieldIf(({ scope }: t.ParserContext) => scope.hasNormal)
    normal!: Vector3;

    @FieldType(ColorRgba)
    @FieldIf(({ scope }: t.ParserContext) => scope.hasColor)
    color!: ColorRgba;

    @FieldType(Vector2)
    @FieldIf(({ scope }: t.ParserContext) => scope.hasUv1)
    uv1!: Vector2;

    @FieldType(Vector2)
    @FieldIf(({ scope }: t.ParserContext) => scope.hasUv2)
    uv2!: Vector2;

    @FieldType(Vector2)
    @FieldIf(({ scope }: t.ParserContext) => scope.hasUv3)
    uv3!: Vector2;

    @FieldType(Vector2)
    @FieldIf(({ scope }: t.ParserContext) => scope.hasUv4)
    uv4!: Vector2;

    @FieldType(Vector3)
    @FieldIf(({ scope }: t.ParserContext) => scope.hasBasisVector)
    s!: Vector3;

    @FieldType(Vector3)
    @FieldIf(({ scope }: t.ParserContext) => scope.hasBasisVector)
    t!: Vector3;
}
