import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';
import { LightMapSectionArray } from './LightMapSectionArray.ts';

@ParserTarget()
export class LightGroup {
    @FieldType(t.String, { size: t.Uint16 })
    name!: string;

    @FieldType(Vector3)
    color!: Vector3;

    @FieldType(t.Uint32)
    lenNIntensityData!: number;

    @FieldType(t.Uint8Array, { count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.lenNIntensityData })
    nIntensityData!: Uint8Array;

    @FieldType(t.Array, { item: LightMapSectionArray, count: t.Uint32 })
    lightMapSectionsMatrix!: LightMapSectionArray[];
}
