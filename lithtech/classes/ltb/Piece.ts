import * as t from '../../../mod.ts';
import { FieldExpose, FieldType, StructTarget } from '../../../mod.ts';
import { RenderObject } from './RenderObject.ts';

@StructTarget()
export class Piece {
    @FieldType(t.String, { size: t.Uint16 })
    name!: string;

    @FieldType(t.Uint32)
    @FieldExpose()
    numLod!: number;

    @FieldType(t.Float32Array, {
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.numLod,
    })
    lodDistances!: Float32Array;

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
