import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';

@ParserTarget()
export class LodMeshInfo {
    @FieldType(t.Uint32)
    objSize!: number;

    @FieldType(t.Uint32)
    numVertexes!: number;

    @FieldType(t.Uint32)
    numFaces!: number;

    @FieldType(t.Uint32)
    maxBonesPerFace!: number;

    @FieldType(t.Uint32)
    maxBonesPerVert!: number;
}
