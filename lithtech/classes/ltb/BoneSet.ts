import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';

@StructTarget()
export class BoneSet {
    @FieldType(t.Uint16)
    indexStart!: number;

    @FieldType(t.Uint16)
    numIndexes!: number;

    @FieldType(t.Uint8Array, { count: 4 })
    boneList!: Uint8Array;

    @FieldType(t.Uint32)
    indexBufferIndex!: number;
}
