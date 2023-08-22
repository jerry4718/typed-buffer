import * as t from '../../../mod.ts';
import { FieldType, getTypedParser, ParserTarget } from '../../../mod.ts';
import { BoneSet } from './BoneSet.ts';
import { MeshType } from './enum.ts';
import { LodMeshInfo } from './LodMeshInfo.ts';
import { VertexContainer } from './VertexContainer.ts';

@ParserTarget()
export class SkeletalMesh {
    @FieldType(LodMeshInfo)
    meshInfo!: LodMeshInfo;

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
        item: getTypedParser(VertexContainer<meshInfo.numVertexes, meshInfo.maxBonesPerFace, vertexTypeMap[Index], MeshType.SkeletalMesh>),
        size: 4,
    })
    vertexContainer!: VertexContainer;

    @FieldType(t.Array, {
        item: t.Uint16,
        size: ({ scope }: t.ParserContext) => (scope[`meshInfo.numFaces * 3`] as number),
    })
    vertexIndex!: number;

    @FieldType(t.Uint32)
    numBoneSet!: number;

    @FieldType(t.Array, {
        item: getTypedParser(BoneSet),
        size: ({ scope }: t.ParserContext) => (scope[`numBoneSet`] as number),
    })
    boneSet!: BoneSet;

}
