import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';

@StructTarget()
export class RenderSection {
    @FieldType(t.Array, { item: t.String({ size: t.Uint16 }), count: 2 })
    declare textures: string[];

    @FieldType(t.Uint8)
    declare shaderCode: number;

    @FieldType(t.Uint32)
    declare numTriangles: number;

    @FieldType(t.String, { size: t.Uint16 })
    declare textureEffect: string[];

    @FieldType(t.Uint32)
    declare lightMapWidth: number;

    @FieldType(t.Uint32)
    declare lightMapHeight: number;

    @FieldType(t.Uint8Array, { count: t.Uint32 })
    declare lightMapData: Uint8Array;
}
