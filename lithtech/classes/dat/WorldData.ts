import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';
import { WorldDataItem } from './WorldDataItem.ts';

@StructTarget()
export class WorldData {
    @FieldType(t.Array, { item: WorldDataItem, count: t.Uint32 })
    worldDataList!: WorldDataItem[];
}
