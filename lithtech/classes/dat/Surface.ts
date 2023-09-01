import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';

@StructTarget()
export class Surface {
    @FieldType(t.Uint32)
    flags!: number;

    @FieldType(t.Uint16)
    textureIndex!: number;

    @FieldType(t.Uint16)
    textureFlags!: number;
}
