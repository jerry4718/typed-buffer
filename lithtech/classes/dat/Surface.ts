import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';

@StructTarget()
export class Surface {
    @FieldType(t.Uint32)
    declare flags: number;

    @FieldType(t.Uint16)
    declare textureIndex: number;

    @FieldType(t.Uint16)
    declare textureFlags: number;
}
