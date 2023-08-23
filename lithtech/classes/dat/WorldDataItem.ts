import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';
import { DataProperty } from './DataProperty.ts';

@ParserTarget()
export class WorldDataItem {
    @FieldType(t.Uint16)
    objectLength!: number;

    @FieldType(t.String, { size: t.Uint16 })
    type!: string;

    @FieldType(t.Array, { item: DataProperty, count: t.Uint32 })
    dataProperties!: DataProperty[];
}
