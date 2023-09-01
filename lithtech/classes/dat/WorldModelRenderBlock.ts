import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';
import { RenderBlock } from './RenderBlock.ts';

@StructTarget()
export class WorldModelRenderBlock {
    @FieldType(t.String, { size: t.Uint16 })
    name!: string;

    @FieldType(t.Array, { item: RenderBlock, count: t.Uint32, })
    renderBlocks!: RenderBlock[];

    @FieldType(t.Uint32)
    noChildFlag!: number;
}
