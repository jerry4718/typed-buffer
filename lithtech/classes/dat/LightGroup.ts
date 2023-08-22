import * as t from '../../../mod.ts';
import { FieldIf, FieldType, getTypedParser, ParserTarget } from '../../../mod.ts';
import { Str2H } from '../common/Str2H.ts';
import { Vector3 } from '../common/Vector3.ts';
import { LightMapSectionArray } from './LightMapSectionArray.ts';

@ParserTarget()
export class LightGroup {
    @FieldType(Str2H)
    name!: Str2H;

    @FieldType(Vector3)
    color!: Vector3;

    @FieldType(t.Uint32)
    lenNIntensityData!: number;

    @FieldType(t.Array, { item: t.Uint8, size: ({ scope }: t.ParserContext) => (scope.lenNIntensityData as number) })
    nIntensityData!: number[];

    @FieldType(t.Uint32)
    numLightMapSectionsMatrix!: number;

    @FieldType(t.Array, {
        item: getTypedParser(LightMapSectionArray),
        size: ({ scope }: t.ParserContext) => (scope[`numLightMapSectionsMatrix`] as number),
    })
    @FieldIf(({ scope }: t.ParserContext) => scope.numLightMapSectionsMatrix !== 0)
    lightMapSectionsMatrix!: LightMapSectionArray;
}
