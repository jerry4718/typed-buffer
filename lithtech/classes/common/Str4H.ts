import * as t from '../../../mod.ts';
import { FieldIf, FieldType, ParserTarget } from '../../../mod.ts';

@ParserTarget()
export class Str4H {
    @FieldType(t.Uint32)
    byteSize!: number;

    @FieldType(t.String, { size: ({ scope }: t.ParserContext) => (scope.byteSize as number) })
    @FieldIf(({ scope }: t.ParserContext) => scope.byteSize !== 0)
    data!: string;
}
