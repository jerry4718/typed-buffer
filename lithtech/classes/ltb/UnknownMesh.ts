import { ParserTarget } from '../../../mod.ts';
import { LodMeshInfo } from './LodMeshInfo.ts';
import { BaseMesh } from './BaseMesh.ts';

@ParserTarget()
export class UnknownMesh extends BaseMesh {
    declare meshInfo: LodMeshInfo;
}
