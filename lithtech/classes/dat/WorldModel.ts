import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';
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
    numPoints!: number;

    @FieldType(t.Uint32)
    numPlanes!: number;

    @FieldType(t.Uint32)
    numSurfaces!: number;

    @FieldType(t.Uint32)
    reserved1!: number;

    @FieldType(t.Uint32)
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
    numTextureNames!: number;

    @FieldType(t.Array, {
        item: t.String({ ends: 0 }),
        count: ({ scope }: t.ParserContext) => scope.numTextureNames,
    })
    textureNames!: string;

    @FieldType(t.Array, {
        item: t.Uint8,
        count: ({ scope }: t.ParserContext) => scope.numPolygons,
    })
    vertexCountList!: number;

    @FieldType(t.Array, {
        item: Plane,
        count: ({ scope }: t.ParserContext) => scope.numPlanes,
    })
    planes!: Plane;

    @FieldType(t.Array, {
        item: Surface,
        count: ({ scope }: t.ParserContext) => scope.numSurfaces,
    })
    surfaces!: Surface;

    @FieldType(t.Array, {
        item: WorldModelPolygon<vertexCountList[Index]>,
        count: ({ scope }: t.ParserContext) => scope.numPolygons,
    })
    polygons!: WorldModelPolygon;

    @FieldType(t.Array, {
        item: WorldModelNode,
        count: ({ scope }: t.ParserContext) => scope.numNodes,
    })
    nodes!: WorldModelNode;

    @FieldType(t.Array, {
        item: Vector3,
        count: ({ scope }: t.ParserContext) => scope.numPoints,
    })
    points!: Vector3;

    @FieldType(t.Int32)
    rootNodeIndex!: number;

    @FieldType(t.Uint32)
    sections!: number;
}
