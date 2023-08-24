import * as t from '../../../mod.ts';
import { FieldExpose, FieldIf, FieldResolve, FieldType, ParserTarget } from '../../../mod.ts';
import { DataMark } from './enums/DataMark.ts';
import { VertexInfo } from './VertexInfo.ts';

@ParserTarget()
export class VertexContainer {
    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => scope.vertexTypeMap[scope.$index])
    @FieldExpose()
    mask!: number;

    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => (scope.mask >> DataMark.LiePosition & 1) > 0)
    @FieldExpose()
    hasPosition!: boolean;

    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => (scope.mask >> DataMark.LieNormal & 1) > 0)
    @FieldExpose()
    hasNormal!: boolean;

    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => (scope.mask >> DataMark.LieColor & 1) > 0)
    @FieldExpose()
    hasColor!: boolean;

    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => (scope.mask >> DataMark.LieUv1 & 1) > 0)
    @FieldExpose()
    hasUv1!: boolean;

    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => (scope.mask >> DataMark.LieUv2 & 1) > 0)
    @FieldExpose()
    hasUv2!: boolean;

    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => (scope.mask >> DataMark.LieUv3 & 1) > 0)
    @FieldExpose()
    hasUv3!: boolean;

    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => (scope.mask >> DataMark.LieUv4 & 1) > 0)
    @FieldExpose()
    hasUv4!: boolean;

    @FieldResolve((_: t.ParserContext, scope: t.ScopeAccessor) => (scope.mask >> DataMark.LieBasisVector & 1) > 0)
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
