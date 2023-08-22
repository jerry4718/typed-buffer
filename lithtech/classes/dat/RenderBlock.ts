import * as t from '../../../mod.ts';
import { FieldIf, FieldType, getTypedParser, ParserTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';
import { LightGroup } from './LightGroup.ts';
import { RenderSection } from './RenderSection.ts';
import { ShaderPoly } from './ShaderPoly.ts';
import { SkyPortal } from './SkyPortal.ts';
import { Triangle } from './Triangle.ts';
import { Vertex } from './Vertex.ts';

@ParserTarget()
export class RenderBlock {
    @FieldType(Vector3)
    center!: Vector3;

    @FieldType(Vector3)
    halfDims!: Vector3;

    @FieldType(t.Uint32)
    numSections!: number;

    @FieldType(t.Array, {
        item: getTypedParser(RenderSection),
        size: ({ scope }: t.ParserContext) => (scope[`numSections`] as number),
    })
    @FieldIf(({ scope }: t.ParserContext) => scope.numSections !== 0)
    sections!: RenderSection;

    @FieldType(t.Uint32)
    numVertexes!: number;

    @FieldType(t.Array, {
        item: getTypedParser(Vertex),
        size: ({ scope }: t.ParserContext) => (scope[`numVertexes`] as number),
    })
    @FieldIf(({ scope }: t.ParserContext) => scope.numVertexes !== 0)
    vertexes!: Vertex;

    @FieldType(t.Uint32)
    numTriangles!: number;

    @FieldType(t.Array, {
        item: getTypedParser(Triangle),
        size: ({ scope }: t.ParserContext) => (scope[`numTriangles`] as number),
    })
    @FieldIf(({ scope }: t.ParserContext) => scope.numTriangles !== 0)
    triangles!: Triangle;

    @FieldType(t.Uint32)
    numSkyPortals!: number;

    @FieldType(t.Array, {
        item: getTypedParser(SkyPortal),
        size: ({ scope }: t.ParserContext) => (scope[`numSkyPortals`] as number),
    })
    @FieldIf(({ scope }: t.ParserContext) => scope.numSkyPortals !== 0)
    skyPortals!: SkyPortal;

    @FieldType(t.Uint32)
    numShaders!: number;

    @FieldType(t.Array, {
        item: getTypedParser(ShaderPoly),
        size: ({ scope }: t.ParserContext) => (scope[`numShaders`] as number),
    })
    @FieldIf(({ scope }: t.ParserContext) => scope.numShaders !== 0)
    shaders!: ShaderPoly;

    @FieldType(t.Uint32)
    numLightGroups!: number;

    @FieldType(t.Array, {
        item: getTypedParser(LightGroup),
        size: ({ scope }: t.ParserContext) => (scope[`numLightGroups`] as number),
    })
    @FieldIf(({ scope }: t.ParserContext) => scope.numLightGroups !== 0)
    lightGroups!: LightGroup;

    @FieldType(t.Uint8)
    childFlags!: number;

    @FieldType(t.Array, {
        item: t.Uint32,
        size: 2,
    })
    childNodeIndices!: number;
}
