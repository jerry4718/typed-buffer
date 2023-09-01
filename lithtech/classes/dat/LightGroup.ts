import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';
import { LightMapSectionArray } from './LightMapSectionArray.ts';

@StructTarget()
export class LightGroup {
    @FieldType(t.String, { size: t.Uint16 })
    declare name: string;

    @FieldType(Vector3)
    declare color: Vector3;

    @FieldType(t.Uint32)
    declare lenNIntensityData: number;

    @FieldType(t.Uint8Array, { count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.lenNIntensityData })
    declare nIntensityData: Uint8Array;

    @FieldType(t.Array, { item: LightMapSectionArray, count: t.Uint32 })
    declare lightMapSectionsMatrix: LightMapSectionArray[];
}
