import { FieldType, ParserTarget } from '../../../mod.ts';
import { LodMeshInfo } from './LodMeshInfo.ts';

@ParserTarget()
export class UnknownMesh {
    @FieldType(LodMeshInfo)
    meshInfo!: LodMeshInfo;
}
