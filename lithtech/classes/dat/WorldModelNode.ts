import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';

@StructTarget()
export class WorldModelNode {
    @FieldType(t.Uint32)
    declare polyIndex: number;

    @FieldType(t.Uint16)
    declare reserved: number;

    @FieldType(t.Int32Array, { count: 2, })
    declare nodeSidesIndices: Int32Array;
}
