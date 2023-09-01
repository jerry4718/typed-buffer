import * as t from '../../../mod.ts';
import { FieldIf, FieldType, StructTarget } from '../../../mod.ts';
import { ColorRgba } from '../common/ColorRgba.ts';
import { Vector2 } from '../common/Vector2.ts';
import { Vector3 } from '../common/Vector3.ts';
import { DataMask } from './enums/DataMask.ts';
import { MeshType } from './enums/MeshType.ts';

@StructTarget()
export class VertexInfo {
    @FieldType(Vector3)
    @FieldIf((_: t.ParserContext, scope: t.ScopeAccessor) => scope.hasPosition)
    declare position: Vector3;

    @FieldType(t.Float32Array, { count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.maxBonesPerFace - 1 })
    @FieldIf((_: t.ParserContext, scope: t.ScopeAccessor) => scope.hasPosition && scope.lodMeshType === MeshType.SkeletalMesh)
    declare weightBlend: Float32Array;

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

/**
 * 读取顶点信息时，一直在反复判断mask，这对性能影响也是极为严重的，，，所以这里做了一个动态逻辑
 */
export function dynamicVertexInfo(mask: number, meshType: number, maxBonesPerFace: number) {
    const hasPosition = (mask & DataMask.Position) > 0;
    const hasNormal = (mask & DataMask.Normal) > 0;
    const hasColor = (mask & DataMask.Color) > 0;
    const hasUv1 = (mask & DataMask.Uv1) > 0;
    const hasUv2 = (mask & DataMask.Uv2) > 0;
    const hasUv3 = (mask & DataMask.Uv3) > 0;
    const hasUv4 = (mask & DataMask.Uv4) > 0;
    const hasBasisVector = (mask & DataMask.BasisVector) > 0;

    const hasWeightBlend = hasPosition && meshType === MeshType.SkeletalMesh;

    @StructTarget()
    class DynamicVertexInfo extends VertexInfo {
        @FieldType(Vector3)
        @FieldIf(hasPosition)
        declare position: Vector3;

        @FieldType(t.Float32Array, { count: maxBonesPerFace - 1 })
        @FieldIf(hasWeightBlend)
        declare weightBlend: Float32Array;

        @FieldType(Vector3)
        @FieldIf(hasNormal)
        declare normal: Vector3;

        @FieldType(ColorRgba)
        @FieldIf(hasColor)
        declare color: ColorRgba;

        @FieldType(Vector2)
        @FieldIf(hasUv1)
        declare uv1: Vector2;

        @FieldType(Vector2)
        @FieldIf(hasUv2)
        declare uv2: Vector2;

        @FieldType(Vector2)
        @FieldIf(hasUv3)
        declare uv3: Vector2;

        @FieldType(Vector2)
        @FieldIf(hasUv4)
        declare uv4: Vector2;

        @FieldType(Vector3)
        @FieldIf(hasBasisVector)
        declare s: Vector3;

        @FieldType(Vector3)
        @FieldIf(hasBasisVector)
        declare t: Vector3;
    }

    return DynamicVertexInfo;
}
