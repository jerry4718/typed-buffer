import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';
import { LightMapSection } from './LightMapSection.ts';

@ParserTarget()
export class LightMapSectionArray {
    @FieldType(t.Array, { item: LightMapSection, count: t.Uint32 })
    lightMapSections!: LightMapSection[];
}
