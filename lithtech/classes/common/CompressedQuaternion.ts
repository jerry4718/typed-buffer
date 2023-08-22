import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';

const DecompressValue = 0x7fff;

@ParserTarget()
export class CompressedQuaternion {
    @FieldType(t.Int16)
    x!: number;

    @FieldType(t.Int16)
    y!: number;

    @FieldType(t.Int16)
    z!: number;

    @FieldType(t.Int16)
    w!: number;
}
