import * as t from '../../../mod.ts';
import { FieldExpose, FieldIf, FieldResolve, FieldType, ParserTarget } from '../../../mod.ts';
import { DataMask } from './enums/DataMask.ts';
import { VertexInfo } from './VertexInfo.ts';

@ParserTarget()
export class VertexContainer {
    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => scope.vertexTypeMap[ scope.$index ])
    @FieldExpose()
    mask!: number;

    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => (scope.mask & DataMask.Position) > 0)
    @FieldExpose()
    hasPosition!: boolean;

    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => (scope.mask & DataMask.Normal) > 0)
    @FieldExpose()
    hasNormal!: boolean;

    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => (scope.mask & DataMask.Color) > 0)
    @FieldExpose()
    hasColor!: boolean;

    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => (scope.mask & DataMask.Uv1) > 0)
    @FieldExpose()
    hasUv1!: boolean;

    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => (scope.mask & DataMask.Uv2) > 0)
    @FieldExpose()
    hasUv2!: boolean;

    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => (scope.mask & DataMask.Uv3) > 0)
    @FieldExpose()
    hasUv3!: boolean;

    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => (scope.mask & DataMask.Uv4) > 0)
    @FieldExpose()
    hasUv4!: boolean;

    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => (scope.mask & DataMask.BasisVector) > 0)
    @FieldExpose()
    hasBasisVector!: boolean;

    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => scope.hasPosition || scope.hasNormal || scope.hasColor || scope.hasBasisVector)
    @FieldExpose()
    isVertexUsed!: boolean;

    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => scope.hasUv1 || scope.hasUv2 || scope.hasUv3 || scope.hasUv4)
    @FieldExpose()
    isFaceVertexUsed!: boolean;

    @FieldType(t.Array, {
        item: VertexInfo,
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.numVertexes,
    })
    @FieldIf((_: t.ParserContext, scope: t.ScopeAccessor) => scope.mask > 0)
    vertexInfos!: VertexInfo[];
}
