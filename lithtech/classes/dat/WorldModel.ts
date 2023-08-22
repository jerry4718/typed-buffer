import * as t from '../../../mod.ts';
import { FieldType, getTypedParser, ParserTarget } from '../../../mod.ts';
import { Str2H } from '../common/Str2H.ts';
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

    @FieldType(Str2H)
    worldNameBox!: Str2H;

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
        size: ({ scope }: t.ParserContext) => (scope[`numTextureNames`] as number),
    })
    textureNames!: string;

    @FieldType(t.Array, {
        item: t.Uint8,
        size: ({ scope }: t.ParserContext) => (scope[`numPolygons`] as number),
    })
    vertexCountList!: number;

    @FieldType(t.Array, {
        item: getTypedParser(Plane),
        size: ({ scope }: t.ParserContext) => (scope[`numPlanes`] as number),
    })
    planes!: Plane;

    @FieldType(t.Array, {
        item: getTypedParser(Surface),
        size: ({ scope }: t.ParserContext) => (scope[`numSurfaces`] as number),
    })
    surfaces!: Surface;

    @FieldType(t.Array, {
        item: getTypedParser(WorldModelPolygon<vertexCountList[Index]>),
        size: ({ scope }: t.ParserContext) => (scope[`numPolygons`] as number),
    })
    polygons!: WorldModelPolygon;

    @FieldType(t.Array, {
        item: getTypedParser(WorldModelNode),
        size: ({ scope }: t.ParserContext) => (scope[`numNodes`] as number),
    })
    nodes!: WorldModelNode;

    @FieldType(t.Array, {
        item: getTypedParser(Vector3),
        size: ({ scope }: t.ParserContext) => (scope[`numPoints`] as number),
    })
    points!: Vector3;

    @FieldType(t.Int32)
    rootNodeIndex!: number;

    @FieldType(t.Uint32)
    sections!: number;

    get worldName() {
        return this.worldNameBox.data;
    }
}
