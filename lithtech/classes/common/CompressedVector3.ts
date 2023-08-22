import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';

const DecompressValue = 16.0;

@ParserTarget()
export class CompressedVector3 {
    @FieldType(t.Int16)
    x!: number;

    @FieldType(t.Int16)
    y!: number;

    @FieldType(t.Int16)
    z!: number;
}
