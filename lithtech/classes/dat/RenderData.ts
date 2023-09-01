import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';
import { RenderBlock } from './RenderBlock.ts';
import { WorldModelRenderBlock } from './WorldModelRenderBlock.ts';

@StructTarget()
export class RenderData {
    @FieldType(t.Array, { item: RenderBlock, count: t.Uint32 })
    declare renderBlocks: RenderBlock[];

    @FieldType(t.Array, { item: WorldModelRenderBlock, count: t.Uint32 })
    declare worldModelRenderBlocks: WorldModelRenderBlock[];
}
