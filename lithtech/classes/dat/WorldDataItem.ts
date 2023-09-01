import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';
import { DataProperty } from './DataProperty.ts';

@StructTarget()
export class WorldDataItem {
    @FieldType(t.Uint16)
    declare objectLength: number;

    @FieldType(t.String, { size: t.Uint16 })
    declare type: string;

    @FieldType(t.Array, { item: DataProperty, count: t.Uint32 })
    declare dataProperties: DataProperty[];
}
