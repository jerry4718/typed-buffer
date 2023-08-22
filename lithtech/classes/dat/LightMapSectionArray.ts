import * as t from '../../../mod.ts';
import { FieldIf, FieldType, getTypedParser, ParserTarget } from '../../../mod.ts';
import { LightMapSection } from './LightMapSection.ts';

@ParserTarget()
export class LightMapSectionArray {
    @FieldType(t.Uint32)
    numLightMapSections!: number;

    @FieldType(t.Array, {
        item: getTypedParser(LightMapSection),
        size: ({ scope }: t.ParserContext) => (scope[`numLightMapSections`] as number),
    })
    @FieldIf(({ scope }: t.ParserContext) => scope.numLightMapSections !== 0)
    lightMapSections!: LightMapSection;
}
