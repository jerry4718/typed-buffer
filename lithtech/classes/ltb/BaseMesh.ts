import { FieldExpose, FieldType, ParserTarget } from '../../../mod.ts';
import { LodMeshInfo } from './LodMeshInfo.ts';

@ParserTarget()
export class BaseMesh {
    @FieldType(LodMeshInfo)
    @FieldExpose()
    meshInfo!: LodMeshInfo;
}
