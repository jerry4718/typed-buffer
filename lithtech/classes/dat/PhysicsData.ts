import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';
import { Polygon } from './Polygon.ts';

@StructTarget()
export class PhysicsData {
    @FieldType(t.Array, { item: Polygon, count: t.Uint32 })
    polygons!: Polygon[];
}
