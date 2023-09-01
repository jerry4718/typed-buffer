import { FieldType, StructTarget } from '../../../mod.ts';
import * as t from '../../../mod.ts';

@StructTarget()
export class ChildModel {
    @FieldType(t.String, { size: t.Uint16 })
    name!: string;
}
