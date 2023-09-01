import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';

@StructTarget()
export class WeightSet {
    @FieldType(t.String, { size: t.Uint16 })
    name!: string;

    @FieldType(t.Float32Array, { count: t.Uint32 })
    nodeWeights!: Float32Array;
}
