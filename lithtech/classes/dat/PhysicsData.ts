import * as t from '../../../mod.ts';
import { FieldIf, FieldType, getTypedParser, ParserTarget } from '../../../mod.ts';
import { Polygon } from './Polygon.ts';

@ParserTarget()
export class PhysicsData {
    @FieldType(t.Uint32)
    numPolygons!: number;

    @FieldType(t.Array, {
        item: getTypedParser(Polygon),
        size: ({ scope }: t.ParserContext) => (scope[`numPolygons`] as number),
    })
    @FieldIf(({ scope }: t.ParserContext) => scope.numPolygons !== 0)
    polygons!: Polygon;
}
