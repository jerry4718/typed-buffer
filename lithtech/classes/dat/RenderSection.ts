import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';

@ParserTarget()
export class RenderSection {
    @FieldType(t.Array, { item: t.String({ size: t.Uint16 }), count: 2 })
    textures!: string[];

    @FieldType(t.Uint8)
    shaderCode!: number;

    @FieldType(t.Uint32)
    numTriangles!: number;

    @FieldType(t.String, { size: t.Uint16 })
    textureEffect!: string[];

    @FieldType(t.Uint32)
    lightMapWidth!: number;

    @FieldType(t.Uint32)
    lightMapHeight!: number;

    @FieldType(t.Uint8Array, { count: t.Uint32 })
    lightMapData!: Uint8Array;
}
