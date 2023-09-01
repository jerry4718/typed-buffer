import * as t from '../../../mod.ts';
import { FieldExpose, FieldType, StructTarget } from '../../../mod.ts';

@StructTarget()
export class LodMeshInfo {
    @FieldType(t.Uint32)
    @FieldExpose()
    declare objSize: number;

    @FieldType(t.Uint32)
    @FieldExpose()
    declare numVertexes: number;

    @FieldType(t.Uint32)
    @FieldExpose()
    declare numFaces: number;

    @FieldType(t.Uint32)
    @FieldExpose()
    declare maxBonesPerFace: number;

    @FieldType(t.Uint32)
    @FieldExpose()
    declare maxBonesPerVert: number;
}
