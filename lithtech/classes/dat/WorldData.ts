import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';
import { WorldDataItem } from './WorldDataItem.ts';

@ParserTarget()
export class WorldData {
    @FieldType(t.Array, { item: WorldDataItem, count: t.Uint32 })
    worldDataList!: WorldDataItem[];
}
