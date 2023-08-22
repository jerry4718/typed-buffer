import * as t from '../../../mod.ts';
import { FieldExpose, FieldPoint, FieldType, ParserTarget } from '../../../mod.ts';
import { DatHeader } from './DatHeader.ts';
import { LightData } from './LightData.ts';
import { ParticleData } from './ParticleData.ts';
import { PhysicsData } from './PhysicsData.ts';
import { RenderData } from './RenderData.ts';
import { World } from './World.ts';
import { WorldData } from './WorldData.ts';
import { WorldTree } from './WorldTree.ts';

@ParserTarget({ endian: 'le' })
export class LithtechDat {
    @FieldType(DatHeader)
    @FieldExpose()
    header!: DatHeader;

    @FieldType(World)
    world!: World;

    @FieldType(WorldTree)
    worldTree!: WorldTree;

    @FieldType(WorldData)
    @FieldPoint(({ scope }: t.ParserContext) => ((scope.header as DatHeader).worldDataPos as number))
    worldData!: WorldData;

    @FieldType(t.Uint32)
    @FieldPoint(({ scope }: t.ParserContext) => ((scope.header as DatHeader).blindDataPos as number))
    blindDataLen!: number;

    @FieldType(LightData)
    @FieldPoint(({ scope }: t.ParserContext) => ((scope.header as DatHeader).lightDataPos as number))
    lightData!: LightData;

    @FieldType(PhysicsData)
    @FieldPoint(({ scope }: t.ParserContext) => ((scope.header as DatHeader).physicsDataPos as number))
    physicsData!: PhysicsData;

    @FieldType(ParticleData)
    @FieldPoint(({ scope }: t.ParserContext) => ((scope.header as DatHeader).particleDataPos as number))
    particleData!: ParticleData;

    @FieldType(RenderData)
    @FieldPoint(({ scope }: t.ParserContext) => ((scope.header as DatHeader).renderDataPos as number))
    renderData!: RenderData;
}
