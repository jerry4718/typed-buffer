import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';

@ParserTarget()
export class WeightSet {
    @FieldType(t.String, { size: t.Uint16 })
    name!: string;

    @FieldType(t.Float32Array, { count: t.Uint32 })
    nodeWeights!: Float32Array;
}
