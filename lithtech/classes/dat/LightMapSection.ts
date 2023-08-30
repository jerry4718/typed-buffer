import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';

@ParserTarget()
export class LightMapSection {
    @FieldType(t.Uint32)
    left!: number;

    @FieldType(t.Uint32)
    top!: number;

    @FieldType(t.Uint32)
    width!: number;

    @FieldType(t.Uint32)
    height!: number;

    @FieldType(t.Uint32)
    lenData!: number;

    @FieldType(t.Uint8Array, { count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.lenData })
    data!: Uint8Array;
}
