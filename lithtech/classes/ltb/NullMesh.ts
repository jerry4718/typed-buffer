import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';

@StructTarget()
export class NullMesh {
    @FieldType(t.Uint8)
    declare offset: number;
}
