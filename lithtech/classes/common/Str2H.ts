import * as t from '../../../mod.ts';
import { FieldExpose, FieldIf, FieldType, ParserTarget } from '../../../mod.ts';

@ParserTarget()
export class Str2H {
    @FieldType(t.Uint16)
    @FieldExpose()
    len!: number;

    @FieldType(t.String, { size: ({ scope }: t.ParserContext) => (scope.len as number) })
    @FieldIf(({ scope }: t.ParserContext) => scope.len !== 0)
    data!: string;
}
