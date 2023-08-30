import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';

@ParserTarget()
export class Triangle {
    @FieldType(t.Uint32Array, { count: 3, })
    vertexIndexes!: Uint32Array;

    @FieldType(t.Uint32)
    polyIndex!: number;
}
