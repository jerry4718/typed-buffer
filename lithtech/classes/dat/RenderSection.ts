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
    textureEffect!: string;

    @FieldType(t.Uint32)
    lightMapWidth!: number;

    @FieldType(t.Uint32)
    lightMapHeight!: number;

    @FieldType(t.Uint32)
    lenLightMapData!: number;

    @FieldType(t.Array, { item: t.Uint8, count: ({ scope }: t.ParserContext) => (scope.lenLightMapData as number) })
    lightMapData!: number[];
}
