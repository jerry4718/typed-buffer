import * as t from '../../../mod.ts';
import { FieldIf, FieldType, StructTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';
import { VertexWeightBlend } from './VertexWeightBlend.ts';
import { ColorRgba } from '../common/ColorRgba.ts';
import { MeshType } from './enums/MeshType.ts';
import { Vector2 } from '../common/Vector2.ts';

@StructTarget()
export class VertexInfo {
    @FieldType(Vector3)
    @FieldIf((_: t.ParserContext, scope: t.ScopeAccessor) => scope.hasPosition)
    declare position: Vector3;

    @FieldType(t.Array, {
        item: VertexWeightBlend,
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.maxBonesPerFace,
    })
    @FieldIf((_: t.ParserContext, scope: t.ScopeAccessor) => scope.hasPosition && scope.renderObjectType === MeshType.SkeletalMesh)
    declare weightBlend: VertexWeightBlend[];

    @FieldType(Vector3)
    @FieldIf((_: t.ParserContext, scope: t.ScopeAccessor) => scope.hasNormal)
    declare normal: Vector3;

    @FieldType(ColorRgba)
    @FieldIf((_: t.ParserContext, scope: t.ScopeAccessor) => scope.hasColor)
    declare color: ColorRgba;

    @FieldType(Vector2)
    @FieldIf((_: t.ParserContext, scope: t.ScopeAccessor) => scope.hasUv1)
    declare uv1: Vector2;

    @FieldType(Vector2)
    @FieldIf((_: t.ParserContext, scope: t.ScopeAccessor) => scope.hasUv2)
    declare uv2: Vector2;

    @FieldType(Vector2)
    @FieldIf((_: t.ParserContext, scope: t.ScopeAccessor) => scope.hasUv3)
    declare uv3: Vector2;

    @FieldType(Vector2)
    @FieldIf((_: t.ParserContext, scope: t.ScopeAccessor) => scope.hasUv4)
    declare uv4: Vector2;

    @FieldType(Vector3)
    @FieldIf((_: t.ParserContext, scope: t.ScopeAccessor) => scope.hasBasisVector)
    declare s: Vector3;

    @FieldType(Vector3)
    @FieldIf((_: t.ParserContext, scope: t.ScopeAccessor) => scope.hasBasisVector)
    declare t: Vector3;
}
