import * as t from '../../../mod.ts';
import { FieldType, getTypedParser, ParserTarget } from '../../../mod.ts';
import { MeshType } from './enum.ts';
import { LodMeshInfo } from './LodMeshInfo.ts';
import { VertexContainer } from './VertexContainer.ts';

@ParserTarget()
export class RigidMesh {
    @FieldType(LodMeshInfo)
    meshInfo!: LodMeshInfo;

    @FieldType(t.Array, {
        item: t.Uint32,
        size: 4,
    })
    vertexTypeMap!: number;

    @FieldType(t.Uint32)
    bone!: number;

    @FieldType(t.Array, {
        item: getTypedParser(VertexContainer<meshInfo.numVertexes, meshInfo.maxBonesPerFace, vertexTypeMap[Index], MeshType.RigidMesh>),
        size: 4,
    })
    vertexContainer!: VertexContainer;

    @FieldType(t.Array, {
        item: t.Uint16,
        size: ({ scope }: t.ParserContext) => ((scope.meshInfo as LodMeshInfo).numFaces * 3),
    })
    vertexIndex!: number;
}
