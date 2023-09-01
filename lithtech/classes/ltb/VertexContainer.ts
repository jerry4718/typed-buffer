import * as t from '../../../mod.ts';
import { FieldExpose, FieldIf, FieldResolve, FieldType, StructTarget } from '../../../mod.ts';
import { DataMask } from './enums/DataMask.ts';
import { dynamicVertexInfo, VertexInfo } from './VertexInfo.ts';

@StructTarget()
export class VertexContainer {
    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => scope.vertexTypeMap[scope.$index])
    @FieldExpose()
    declare mask: number;

    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => (scope.mask & DataMask.Position) > 0)
    @FieldExpose()
    declare hasPosition: boolean;

    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => (scope.mask & DataMask.Normal) > 0)
    @FieldExpose()
    declare hasNormal: boolean;

    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => (scope.mask & DataMask.Color) > 0)
    @FieldExpose()
    declare hasColor: boolean;

    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => (scope.mask & DataMask.Uv1) > 0)
    @FieldExpose()
    declare hasUv1: boolean;

    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => (scope.mask & DataMask.Uv2) > 0)
    @FieldExpose()
    declare hasUv2: boolean;

    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => (scope.mask & DataMask.Uv3) > 0)
    @FieldExpose()
    declare hasUv3: boolean;

    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => (scope.mask & DataMask.Uv4) > 0)
    @FieldExpose()
    declare hasUv4: boolean;

    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => (scope.mask & DataMask.BasisVector) > 0)
    @FieldExpose()
    declare hasBasisVector: boolean;

    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => scope.hasPosition || scope.hasNormal || scope.hasColor || scope.hasBasisVector)
    @FieldExpose()
    declare isVertexUsed: boolean;

    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => scope.hasUv1 || scope.hasUv2 || scope.hasUv3 || scope.hasUv4)
    @FieldExpose()
    declare isFaceVertexUsed: boolean;

    @FieldType(t.Array, {
        item: (_: t.ParserContext, scope: t.ScopeAccessor) => dynamicVertexInfo(scope.mask, scope.lodMeshType, scope.maxBonesPerFace),
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.numVertexes,
    })
    @FieldIf((_: t.ParserContext, scope: t.ScopeAccessor) => scope.mask > 0)
    declare vertexInfos: VertexInfo[];
}
