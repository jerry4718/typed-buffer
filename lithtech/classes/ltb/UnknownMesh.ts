import { ParserTarget } from '../../../mod.ts';
import { LodMeshInfo } from './LodMeshInfo.ts';

@ParserTarget()
export class UnknownMesh extends LodMeshInfo {
    declare objSize: number;
    declare numVertexes: number;
    declare numFaces: number;
    declare maxBonesPerFace: number;
    declare maxBonesPerVert: number;
}
