import * as t from '../../../mod.ts';
import { FieldExpose, FieldType, StructTarget } from '../../../mod.ts';
import { BoneSet } from './BoneSet.ts';
import { LodMeshInfo } from './LodMeshInfo.ts';
import { VertexContainer } from './VertexContainer.ts';

@StructTarget()
export class SkeletalMesh extends LodMeshInfo {
    declare objSize: number;
    declare numVertexes: number;
    declare numFaces: number;
    declare maxBonesPerFace: number;
    declare maxBonesPerVert: number;

    @FieldType(t.Uint8)
    reIndexedBone!: number;

    @FieldType(t.Uint32Array, { count: 4 })
    @FieldExpose()
    vertexTypeMap!: Uint32Array;

    @FieldType(t.Uint8)
    matrixPalette!: number;

    @FieldType(t.Array, { item: VertexContainer, count: 4 })
    vertexContainer!: VertexContainer[];

    @FieldType(t.Uint16Array, {
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.numFaces * 3,
    })
    vertexIndex!: Uint16Array;

    @FieldType(t.Array, { item: BoneSet, count: t.Uint32 })
    boneSet!: BoneSet[];
}
