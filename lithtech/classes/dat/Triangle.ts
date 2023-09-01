import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';

@StructTarget()
export class Triangle {
    @FieldType(t.Uint32Array, { count: 3, })
    declare vertexIndexes: Uint32Array;

    @FieldType(t.Uint32)
    declare polyIndex: number;
}
