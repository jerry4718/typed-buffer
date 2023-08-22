import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';

@ParserTarget()
export class ColorRgba {
    @FieldType(t.Uint8)
    r!: number;

    @FieldType(t.Uint8)
    g!: number;

    @FieldType(t.Uint8)
    b!: number;

    @FieldType(t.Uint8)
    a!: number;

    get originHex () {
        return (this.r << 24) & (this.g << 16) & (this.b << 8) & this.a
    }
}
