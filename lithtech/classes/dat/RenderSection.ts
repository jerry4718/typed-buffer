import * as t from '../../../mod.ts';
import { FieldType, ParserTarget, getTypedParser } from '../../../mod.ts';
import { Str2H } from '../common/Str2H.ts';

@ParserTarget()
export class RenderSection {
    @FieldType(t.Array, {
        item: getTypedParser(Str2H),
        size: 2,
    })
    texturesBox!: Str2H[];

    @FieldType(t.Uint8)
    shaderCode!: number;

    @FieldType(t.Uint32)
    numTriangles!: number;

    @FieldType(Str2H)
    textureEffectBox!: Str2H;

    @FieldType(t.Uint32)
    lightMapWidth!: number;

    @FieldType(t.Uint32)
    lightMapHeight!: number;

    @FieldType(t.Uint32)
    lenLightMapData!: number;

    @FieldType(t.Array, { item: t.Uint8, size: ({ scope }: t.ParserContext) => (scope.lenLightMapData as number) })
    lightMapData!: number[];

    get textures() {
        return [ this.texturesBox[0].data, this.texturesBox[1].data ];
    }

    get textureEffect() {
        return this.textureEffectBox.data;
    }
}
