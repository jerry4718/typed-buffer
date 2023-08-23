import * as t from '../../../mod.ts';
import { FieldExpose, FieldType, ParserTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';
import { Plane } from './Plane.ts';
import { Surface } from './Surface.ts';
import { WorldModelNode } from './WorldModelNode.ts';
import { WorldModelPolygon } from './WorldModelPolygon.ts';

@ParserTarget()
export class WorldModel {
    @FieldType(t.Uint32)
    reserved!: number;

    @FieldType(t.Uint32)
    worldInfoFlag!: number;

    @FieldType(t.String, { size: t.Uint16 })
    worldName!: string;

    @FieldType(t.Uint32)
    @FieldExpose()
    numPoints!: number;

    @FieldType(t.Uint32)
    @FieldExpose()
    numPlanes!: number;

    @FieldType(t.Uint32)
    @FieldExpose()
    numSurfaces!: number;

    @FieldType(t.Uint32)
    reserved1!: number;

    @FieldType(t.Uint32)
    @FieldExpose()
    numPolygons!: number;

    @FieldType(t.Uint32)
    reserved2!: number;

    @FieldType(t.Uint32)
    numPolygonVertexIndexes!: number;

    @FieldType(t.Uint32)
    reserved3!: number;

    @FieldType(t.Uint32)
    reserved4!: number;

    @FieldType(t.Uint32)
    @FieldExpose()
    numNodes!: number;

    @FieldType(Vector3)
    boxMin!: Vector3;

    @FieldType(Vector3)
    boxMax!: Vector3;

    @FieldType(Vector3)
    worldTranslation!: Vector3;

    @FieldType(t.Uint32)
    textureNameSize!: number;

    @FieldType(t.Uint32)
    @FieldExpose()
    numTextureNames!: number;

    @FieldType(t.Array, {
        item: t.String({ ends: 0x00 }),
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.numTextureNames,
    })
    textureNames!: string[];

    @FieldType(t.Array, {
        item: t.Uint8,
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.numPolygons,
    })
    @FieldExpose()
    vertexCountList!: number[];

    @FieldType(t.Array, {
        item: Plane,
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.numPlanes,
    })
    planes!: Plane[];

    @FieldType(t.Array, {
        item: Surface,
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.numSurfaces,
    })
    surfaces!: Surface[];

    @FieldType(t.Array, {
        item: WorldModelPolygon,
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.numPolygons,
    })
    polygons!: WorldModelPolygon[];

    @FieldType(t.Array, {
        item: WorldModelNode,
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.numNodes,
    })
    nodes!: WorldModelNode[];

    @FieldType(t.Array, {
        item: Vector3,
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.numPoints,
    })
    points!: Vector3[];

    @FieldType(t.Int32)
    rootNodeIndex!: number;

    @FieldType(t.Uint32)
    sections!: number;
}
