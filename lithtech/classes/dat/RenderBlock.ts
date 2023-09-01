import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';
import { LightGroup } from './LightGroup.ts';
import { RenderSection } from './RenderSection.ts';
import { ShaderPoly } from './ShaderPoly.ts';
import { SkyPortal } from './SkyPortal.ts';
import { Triangle } from './Triangle.ts';
import { Vertex } from './Vertex.ts';

@StructTarget()
export class RenderBlock {
    @FieldType(Vector3)
    declare center: Vector3;

    @FieldType(Vector3)
    declare halfDims: Vector3;

    @FieldType(t.Array, { item: RenderSection, count: t.Uint32 })
    declare sections: RenderSection[];

    @FieldType(t.Array, { item: Vertex, count: t.Uint32 })
    declare vertexes: Vertex[];

    @FieldType(t.Array, { item: Triangle, count: t.Uint32 })
    declare triangles: Triangle[];

    @FieldType(t.Array, { item: SkyPortal, count: t.Uint32 })
    declare skyPortals: SkyPortal[];

    @FieldType(t.Array, { item: ShaderPoly, count: t.Uint32 })
    declare shaders: ShaderPoly[];

    @FieldType(t.Array, { item: LightGroup, count: t.Uint32 })
    declare lightGroups: LightGroup[];

    @FieldType(t.Uint8)
    declare childFlags: number;

    @FieldType(t.Uint32Array, { count: 2 })
    declare childNodeIndices: Uint32Array;
}
