import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';

@ParserTarget()
export class Vector3 {
    @FieldType(t.Float32)
    x!: number;

    @FieldType(t.Float32)
    y!: number;

    @FieldType(t.Float32)
    z!: number;
}