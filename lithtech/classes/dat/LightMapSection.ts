import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';

@StructTarget()
export class LightMapSection {
    @FieldType(t.Uint32)
    declare left: number;

    @FieldType(t.Uint32)
    declare top: number;

    @FieldType(t.Uint32)
    declare width: number;

    @FieldType(t.Uint32)
    declare height: number;

    @FieldType(t.Uint32)
    declare lenData: number;

    @FieldType(t.Uint8Array, { count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.lenData })
    declare data: Uint8Array;
}
