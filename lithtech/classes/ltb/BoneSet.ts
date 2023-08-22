import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';

@ParserTarget()
export class BoneSet {
    @FieldType(t.Uint16)
    indexStart!: number;

    @FieldType(t.Uint16)
    numIndexes!: number;

    @FieldType(t.Array, { item: t.Uint8, size: 4 })
    boneList!: number;

    @FieldType(t.Uint32)
    indexBufferIndex!: number;
}
