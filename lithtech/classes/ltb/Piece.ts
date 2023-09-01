import * as t from '../../../mod.ts';
import { FieldExpose, FieldType, StructTarget } from '../../../mod.ts';
import { RenderObject } from './RenderObject.ts';

@StructTarget()
export class Piece {
    @FieldType(t.String, { size: t.Uint16 })
    declare name: string;

    @FieldType(t.Uint32)
    @FieldExpose()
    declare numLod: number;

    @FieldType(t.Float32Array, {
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.numLod,
    })
    declare lodDistances: Float32Array;

    @FieldType(t.Uint32)
    declare lodMin: number;

    @FieldType(t.Uint32)
    declare lodMax: number;

    @FieldType(t.Array, {
        item: RenderObject,
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.numLod,
    })
    declare renderObjects: RenderObject[];
}
