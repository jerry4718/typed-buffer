import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';
import { LightMapSection } from './LightMapSection.ts';

@StructTarget()
export class LightMapSectionArray {
    @FieldType(t.Array, { item: LightMapSection, count: t.Uint32 })
    declare lightMapSections: LightMapSection[];
}
