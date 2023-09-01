import * as t from '../../../mod.ts';
import { FieldExpose, FieldType, StructTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';
import { Plane } from './Plane.ts';
import { Surface } from './Surface.ts';
import { WorldModelNode } from './WorldModelNode.ts';
import { WorldModelPolygon } from './WorldModelPolygon.ts';

@StructTarget()
export class WorldModel {
    // always zero
    @FieldType(t.Uint32)
    declare reserved: number;

    @FieldType(t.Uint32)
    declare worldInfoFlag: number;

    @FieldType(t.String, { size: t.Uint16 })
    declare worldName: string;

    @FieldType(t.Uint32)
    @FieldExpose()
    declare numPoints: number;

    @FieldType(t.Uint32)
    @FieldExpose()
    declare numPlanes: number;

    @FieldType(t.Uint32)
    @FieldExpose()
    declare numSurfaces: number;

    @FieldType(t.Uint32)
    declare reserved1: number;

    @FieldType(t.Uint32)
    @FieldExpose()
    declare numPolygons: number;

    @FieldType(t.Uint32)
    declare reserved2: number;

    @FieldType(t.Uint32)
    declare numPolygonVertexIndexes: number;

    @FieldType(t.Uint32)
    declare reserved3: number;

    @FieldType(t.Uint32)
    declare reserved4: number;

    @FieldType(t.Uint32)
    @FieldExpose()
    declare numNodes: number;

    @FieldType(Vector3)
    declare boxMin: Vector3;

    @FieldType(Vector3)
    declare boxMax: Vector3;

    @FieldType(Vector3)
    declare worldTranslation: Vector3;

    @FieldType(t.Uint32)
    declare textureNameSize: number;

    @FieldType(t.Uint32)
    @FieldExpose()
    declare numTextureNames: number;

    @FieldType(t.Array, {
        item: t.String({ ends: 0x00 }),
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.numTextureNames,
    })
    declare textureNames: string[];

    @FieldType(t.Uint8Array, {
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.numPolygons,
    })
    @FieldExpose()
    declare vertexCountList: Uint8Array;

    @FieldType(t.Array, {
        item: Plane,
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.numPlanes,
    })
    declare planes: Plane[];

    @FieldType(t.Array, {
        item: Surface,
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.numSurfaces,
    })
    declare surfaces: Surface[];

    @FieldType(t.Array, {
        item: WorldModelPolygon,
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.numPolygons,
    })
    declare polygons: WorldModelPolygon[];

    @FieldType(t.Array, {
        item: WorldModelNode,
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.numNodes,
    })
    declare nodes: WorldModelNode[];

    @FieldType(t.Array, {
        item: Vector3,
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.numPoints,
    })
    declare points: Vector3[];

    @FieldType(t.Int32)
    declare rootNodeIndex: number;

    @FieldType(t.Uint32)
    declare sections: number;
}
