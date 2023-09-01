import * as t from '../../../mod.ts';
import { FieldExpose, FieldType, StructTarget } from '../../../mod.ts';
import { LodMeshInfo } from './LodMeshInfo.ts';
import { VertexContainer } from './VertexContainer.ts';

@StructTarget()
export class RigidMesh extends LodMeshInfo {
    declare objSize: number;
    declare numVertexes: number;
    declare numFaces: number;
    declare maxBonesPerFace: number;
    declare maxBonesPerVert: number;

    @FieldType(t.Uint32Array, { count: 4 })
    @FieldExpose()
    declare vertexTypeMap: Uint32Array;

    @FieldType(t.Uint32)
    declare bone: number;

    @FieldType(t.Array, { item: VertexContainer, count: 4 })
    declare vertexContainer: VertexContainer[];

    @FieldType(t.Uint16Array, {
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.numFaces * 3,
    })
    declare vertexIndex: Uint16Array;
}
