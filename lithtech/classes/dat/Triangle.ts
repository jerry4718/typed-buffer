import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';

@ParserTarget()
export class Triangle {
    @FieldType(t.Array, {
        item: t.Uint32,
        size: 3,
    })
    vertexIndexes!: number;

    @FieldType(t.Uint32)
    polyIndex!: number;
}
