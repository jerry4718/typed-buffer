import * as t from '../../../mod.ts';
import { FieldIf, FieldType, getTypedParser, ParserTarget } from '../../../mod.ts';
import { Str2H } from '../common/Str2H.ts';
import { RenderBlock } from './RenderBlock.ts';

@ParserTarget()
export class WorldModelRenderBlock {
    @FieldType(Str2H)
    nameBox!: Str2H;

    @FieldType(t.Uint32)
    numRenderBlocks!: number;

    @FieldType(t.Array, {
        item: getTypedParser(RenderBlock),
        size: ({ scope }: t.ParserContext) => (scope[`numRenderBlocks`] as number),
    })
    @FieldIf(({ scope }: t.ParserContext) => scope.numRenderBlocks !== 0)
    renderBlocks!: RenderBlock;

    @FieldType(t.Uint32)
    noChildFlag!: number;

    get name() {
        return this.nameBox.data;
    }
}
