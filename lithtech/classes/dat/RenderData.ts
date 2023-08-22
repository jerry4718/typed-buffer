import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';
import { RenderBlock } from './RenderBlock.ts';
import { WorldModelRenderBlock } from './WorldModelRenderBlock.ts';

@ParserTarget()
export class RenderData {
    @FieldType(t.Array, { item: RenderBlock, count: t.Uint32 })
    renderBlocks!: RenderBlock[];

    @FieldType(t.Array, { item: WorldModelRenderBlock, count: t.Uint32 })
    worldModelRenderBlocks!: WorldModelRenderBlock[];
}
