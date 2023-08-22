import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';

@ParserTarget()
export class NullMesh {
    @FieldType(t.Uint8)
    offset!: number;
}
