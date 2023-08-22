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
    @FieldPoint(({ scope }: t.ParserContext) => (scope[`header.world_data_pos`] as number))
    worldData!: WorldData;

    @FieldType(t.Uint32)
    @FieldPoint(({ scope }: t.ParserContext) => (scope[`header.blind_data_pos`] as number))
    blindDataLen!: number;

    @FieldType(LightData)
    @FieldPoint(({ scope }: t.ParserContext) => (scope[`header.light_data_pos`] as number))
    lightData!: LightData;

    @FieldType(PhysicsData)
    @FieldPoint(({ scope }: t.ParserContext) => (scope[`header.physics_data_pos`] as number))
    physicsData!: PhysicsData;

    @FieldType(ParticleData)
    @FieldPoint(({ scope }: t.ParserContext) => (scope[`header.particle_data_pos`] as number))
    particleData!: ParticleData;

    @FieldType(RenderData)
    @FieldPoint(({ scope }: t.ParserContext) => (scope[`header.render_data_pos`] as number))
    renderData!: RenderData;
}
