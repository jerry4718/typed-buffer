import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';

@StructTarget()
export class Keyframe {
    @FieldType(t.Uint32)
    time!: number;

    @FieldType(t.String, { size: t.Uint16 })
    string!: string;
}
