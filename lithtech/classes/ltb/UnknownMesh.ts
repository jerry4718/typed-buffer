import { ParserTarget } from '../../../mod.ts';
import { BaseMesh } from './BaseMesh.ts';
import { LodMeshInfo } from './LodMeshInfo.ts';

@ParserTarget()
export class UnknownMesh extends BaseMesh {
    declare meshInfo: LodMeshInfo;
}
