import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';

@ParserTarget()
export class Surface {
    @FieldType(t.Uint32)
    flags!: number;

    @FieldType(t.Uint16)
    textureIndex!: number;

    @FieldType(t.Uint16)
    textureFlags!: number;
}
