import * as t from '../../../mod.ts';
import { FieldExpose, FieldSetup, FieldType, ParserTarget } from '../../../mod.ts';
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

    @FieldType(t.Array, { item: t.Uint32, count: 4 })
    @FieldExpose()
    vertexTypeMap!: number[];

    @FieldType(t.Uint8)
    matrixPalette!: number;

    @FieldType(t.Array, { item: VertexContainer, count: 4 })
    @FieldSetup('meshType', MeshType.SkeletalMesh)
    vertexContainer!: VertexContainer[];

    @FieldType(t.Array, {
        item: t.Uint16,
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.meshInfo.numFaces * 3,
    })
    vertexIndex!: number[];

    @FieldType(t.Array, { item: BoneSet, count: t.Uint32 })
    boneSet!: BoneSet[];
}
