import * as t from '../../../mod.ts';
import { FieldIf, FieldType, ParserTarget, getTypedParser } from '../../../mod.ts';
import { Str2H } from '../common/Str2H.ts';
import { DataProperty } from './DataProperty.ts';

@ParserTarget()
export class WorldDataItem {
    @FieldType(t.Uint16)
    objectLength!: number;

    @FieldType(Str2H)
    typeBox!: Str2H;

    @FieldType(t.Uint32)
    numDataProperties!: number;

    @FieldType(t.Array, {
        item: getTypedParser(DataProperty),
        size: ({ scope }: t.ParserContext) => (scope[`numDataProperties`] as number),
    })
    @FieldIf(({ scope }: t.ParserContext) => scope.numDataProperties !== 0)
    dataProperties!: DataProperty;

    get type() {
        return this.typeBox.data;
    }
}
