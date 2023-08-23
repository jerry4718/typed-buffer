import * as t from '../../../mod.ts';
import { FieldExpose, FieldIf, FieldType, ParserTarget } from '../../../mod.ts';
import { RenderObject } from './RenderObject.ts';

@ParserTarget()
export class Piece {
    @FieldType(t.String, { size: t.Uint16 })
    name!: string;

    @FieldType(t.Uint32)
    @FieldExpose()
    numLod!: number;

    @FieldType(t.Array, {
        item: t.Float32,
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.numLod,
    })
    lodDistances!: number[];

    @FieldType(t.Uint32)
    lodMin!: number;

    @FieldType(t.Uint32)
    lodMax!: number;

    @FieldType(t.Array, {
        item: RenderObject,
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.numLod,
    })
    renderObjects!: RenderObject[];
}
