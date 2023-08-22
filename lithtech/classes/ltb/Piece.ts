import * as t from '../../../mod.ts';
import { FieldIf, FieldType, getTypedParser, ParserTarget } from '../../../mod.ts';
import { Str2H } from '../common/Str2H.ts';
import { RenderObject } from './RenderObject.ts';

@ParserTarget()
export class Piece {
    @FieldType(Str2H)
    nameBox!: Str2H;

    @FieldType(t.Uint32)
    numLod!: number;

    @FieldType(t.Array, {
        item: t.Float32,
        size: ({ scope }: t.ParserContext) => (scope[`numLod`] as number),
    })
    @FieldIf(({ scope }: t.ParserContext) => scope.numLod !== 0)
    lodDistances!: number;

    @FieldType(t.Uint32)
    lodMin!: number;

    @FieldType(t.Uint32)
    lodMax!: number;

    @FieldType(t.Array, {
        item: getTypedParser(RenderObject),
        size: ({ scope }: t.ParserContext) => (scope[`numLod`] as number),
    })
    @FieldIf(({ scope }: t.ParserContext) => scope.numLod !== 0)
    renderObjects!: RenderObject;

    get name() {
        return this.nameBox.data;
    }
}
