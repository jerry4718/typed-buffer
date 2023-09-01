import { StructTarget } from '../../../mod.ts';
import { LodMeshInfo } from './LodMeshInfo.ts';

@StructTarget()
export class VertexAnimatedMesh extends LodMeshInfo {
    declare objSize: number;
    declare numVertexes: number;
    declare numFaces: number;
    declare maxBonesPerFace: number;
    declare maxBonesPerVert: number;
}
