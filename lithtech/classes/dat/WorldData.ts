import * as t from '../../../mod.ts';
import { FieldIf, FieldType, getTypedParser, ParserTarget } from '../../../mod.ts';
import { WorldDataItem } from './WorldDataItem.ts';

@ParserTarget()
export class WorldData {
    @FieldType(t.Uint32)
    numWorldDataList!: number;

    @FieldType(t.Array, {
        item: getTypedParser(WorldDataItem),
        size: ({ scope }: t.ParserContext) => (scope[`numWorldDataList`] as number),
    })
    @FieldIf(({ scope }: t.ParserContext) => scope.numWorldDataList !== 0)
    worldDataList!: WorldDataItem;
}
