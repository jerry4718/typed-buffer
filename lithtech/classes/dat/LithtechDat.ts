import * as t from '../../../mod.ts';
import { FieldExpose, FieldPoint, FieldType, StructTarget } from '../../../mod.ts';
import { DatHeader } from './DatHeader.ts';
import { LightData } from './LightData.ts';
import { ParticleData } from './ParticleData.ts';
import { PhysicsData } from './PhysicsData.ts';
import { RenderData } from './RenderData.ts';
import { World } from './World.ts';
import { WorldData } from './WorldData.ts';
import { WorldTree } from './WorldTree.ts';

@StructTarget({ endian: 'le' })
export class LithtechDat {
    @FieldType(DatHeader)
    @FieldExpose()
    header!: DatHeader;

    @FieldType(World)
    world!: World;

    @FieldType(WorldTree)
    worldTree!: WorldTree;

    @FieldType(WorldData)
    @FieldPoint((_: t.ParserContext, scope: t.ScopeAccessor) => scope.header.worldDataPos)
    worldData!: WorldData;

    @FieldType(t.Uint32)
    @FieldPoint((_: t.ParserContext, scope: t.ScopeAccessor) => scope.header.blindDataPos)
    blindDataLen!: number;

    @FieldType(LightData)
    @FieldPoint((_: t.ParserContext, scope: t.ScopeAccessor) => scope.header.lightDataPos)
    lightData!: LightData;

    @FieldType(PhysicsData)
    @FieldPoint((_: t.ParserContext, scope: t.ScopeAccessor) => scope.header.physicsDataPos)
    physicsData!: PhysicsData;

    @FieldType(ParticleData)
    @FieldPoint((_: t.ParserContext, scope: t.ScopeAccessor) => scope.header.particleDataPos)
    particleData!: ParticleData;

    @FieldType(RenderData)
    @FieldPoint((_: t.ParserContext, scope: t.ScopeAccessor) => scope.header.renderDataPos)
    renderData!: RenderData;
}
