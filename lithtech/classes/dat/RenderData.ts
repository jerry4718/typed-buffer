import * as t from '../../../mod.ts';
import { FieldIf, FieldType, getTypedParser, ParserTarget } from '../../../mod.ts';
import { RenderBlock } from './RenderBlock.ts';
import { WorldModelRenderBlock } from './WorldModelRenderBlock.ts';

@ParserTarget()
export class RenderData {
    @FieldType(t.Uint32)
    numRenderBlocks!: number;

    @FieldType(t.Array, {
        item: getTypedParser(RenderBlock),
        size: ({ scope }: t.ParserContext) => (scope[`numRenderBlocks`] as number),
    })
    @FieldIf(({ scope }: t.ParserContext) => scope.numRenderBlocks !== 0)
    renderBlocks!: RenderBlock;

    @FieldType(t.Uint32)
    numWorldModelRenderBlocks!: number;

    @FieldType(t.Array, {
        item: getTypedParser(WorldModelRenderBlock),
        size: ({ scope }: t.ParserContext) => (scope[`numWorldModelRenderBlocks`] as number),
    })
    @FieldIf(({ scope }: t.ParserContext) => scope.numWorldModelRenderBlocks !== 0)
    worldModelRenderBlocks!: WorldModelRenderBlock;
}
