import { FieldType, ParserTarget } from '../../../mod.ts';
import * as t from '../../../mod.ts';

@ParserTarget()
export class ChildModel {
    @FieldType(t.String, { size: t.Uint16 })
    name!: string;
}
