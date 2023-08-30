import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';

@ParserTarget()
export class WorldModelNode {
    @FieldType(t.Uint32)
    polyIndex!: number;

    @FieldType(t.Uint16)
    reserved!: number;

    @FieldType(t.Int32Array, { count: 2, })
    nodeSidesIndices!: Int32Array;
}
