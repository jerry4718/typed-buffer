import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';
import { Polygon } from './Polygon.ts';

@ParserTarget()
export class PhysicsData {
    @FieldType(t.Array, { item: Polygon, count: t.Uint32 })
    polygons!: Polygon[];
}
