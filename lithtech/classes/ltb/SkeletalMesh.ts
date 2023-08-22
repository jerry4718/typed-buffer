import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';
import { BoneSet } from './BoneSet.ts';
import { MeshType } from './enums/MeshType.ts';
import { LodMeshInfo } from './LodMeshInfo.ts';
import { VertexContainer } from './VertexContainer.ts';
import { BaseMesh } from './BaseMesh.ts';

@ParserTarget()
export class SkeletalMesh extends BaseMesh {
    declare meshInfo: LodMeshInfo;

    @FieldType(t.Uint8)
    reIndexedBone!: number;

    @FieldType(t.Array, {
        item: t.Uint32,
        size: 4,
    })
    vertexTypeMap!: number;

    @FieldType(t.Uint8)
    matrixPalette!: number;

    @FieldType(t.Array, {
        item: VertexContainer<meshInfo.numVertexes, meshInfo.maxBonesPerFace, vertexTypeMap[Index], MeshType.SkeletalMesh>,
        size: 4,
    })
    vertexContainer!: VertexContainer;

    @FieldType(t.Array, {
        item: t.Uint16,
        count: ({ scope }: t.ParserContext) => scope.meshInfo.numFaces * 3,
    })
    vertexIndex!: number;

    @FieldType(t.Uint32)
    numBoneSet!: number;

    @FieldType(t.Array, {
        item: BoneSet,
        count: ({ scope }: t.ParserContext) => scope.numBoneSet,
    })
    boneSet!: BoneSet;
}
