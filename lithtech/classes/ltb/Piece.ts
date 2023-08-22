import * as t from '../../../mod.ts';
import { FieldIf, FieldType, ParserTarget } from '../../../mod.ts';
import { RenderObject } from './RenderObject.ts';

@ParserTarget()
export class Piece {
    @FieldType(t.String, { size: t.Uint16 })
    name!: string;

    @FieldType(t.Uint32)
    numLod!: number;

    @FieldType(t.Array, {
        item: t.Float32,
        count: ({ scope }: t.ParserContext) => scope.numLod,
    })
    @FieldIf(({ scope }: t.ParserContext) => scope.numLod !== 0)
    lodDistances!: number;

    @FieldType(t.Uint32)
    lodMin!: number;

    @FieldType(t.Uint32)
    lodMax!: number;

    @FieldType(t.Array, {
        item: RenderObject,
        count: ({ scope }: t.ParserContext) => scope.numLod,
    })
    @FieldIf(({ scope }: t.ParserContext) => scope.numLod !== 0)
    renderObjects!: RenderObject;
}
