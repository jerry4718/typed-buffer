import * as t from '../../../mod.ts';
import { FieldExpose, FieldType, ParserTarget } from '../../../mod.ts';

@ParserTarget()
export class LodMeshInfo {
    @FieldType(t.Uint32)
    @FieldExpose()
    objSize!: number;

    @FieldType(t.Uint32)
    @FieldExpose()
    numVertexes!: number;

    @FieldType(t.Uint32)
    @FieldExpose()
    numFaces!: number;

    @FieldType(t.Uint32)
    @FieldExpose()
    maxBonesPerFace!: number;

    @FieldType(t.Uint32)
    @FieldExpose()
    maxBonesPerVert!: number;
}
