import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';

@ParserTarget()
export class ColorRgb {
    @FieldType(t.Float32)
    r!: number;

    @FieldType(t.Float32)
    g!: number;

    @FieldType(t.Float32)
    b!: number;
}
