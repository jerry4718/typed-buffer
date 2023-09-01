import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';

@StructTarget()
export class Triangle {
    @FieldType(t.Uint32Array, { count: 3, })
    vertexIndexes!: Uint32Array;

    @FieldType(t.Uint32)
    polyIndex!: number;
}
