import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';

@StructTarget()
export class BoneSet {
    @FieldType(t.Uint16)
    declare indexStart: number;

    @FieldType(t.Uint16)
    declare numIndexes: number;

    @FieldType(t.Uint8Array, { count: 4 })
    declare boneList: Uint8Array;

    @FieldType(t.Uint32)
    declare indexBufferIndex: number;
}
