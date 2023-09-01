import { FieldExpose, FieldType, StructTarget } from '../../../mod.ts';
import { LodMeshInfo } from './LodMeshInfo.ts';

@StructTarget()
export class BaseMesh {
    @FieldType(LodMeshInfo)
    @FieldExpose()
    declare meshInfo: LodMeshInfo;
}
