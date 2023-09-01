import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';
import { Polygon } from './Polygon.ts';

@StructTarget()
export class ParticleData {
    @FieldType(t.Array, { item: Polygon, count: t.Uint32 })
    declare polygons: Polygon[];
}
