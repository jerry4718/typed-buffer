import { FieldType, ParserTarget } from '../../../mod.ts';
import { LodMeshInfo } from './LodMeshInfo.ts';

@ParserTarget()
export class VertexAnimatedMesh {
    @FieldType(LodMeshInfo)
    meshInfo!: LodMeshInfo;
}
